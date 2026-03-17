import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
  query, where, limit, orderBy, writeBatch, serverTimestamp,
  Timestamp, increment, arrayUnion,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { db } from './firebase-config.js';
import { generateTeamCode, generateId } from './utils.js';

// ── Game State ────────────────────────────────────────────────────────────────

export async function getGameState() {
  const snap = await getDoc(doc(db, 'gameState', 'current'));
  return snap.exists() ? snap.data() : null;
}

export async function initializeGameState() {
  const ref = doc(db, 'gameState', 'current');
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      phase: 'lobby',
      gameStartTime: null,
      gameEndTime: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

// ── Team & Player ─────────────────────────────────────────────────────────────

export async function createTeam(teamName, playerName) {
  let teamCode = generateTeamCode();
  let isUnique = false;
  while (!isUnique) {
    const snap = await getDocs(query(collection(db, 'teams'), where('teamCode', '==', teamCode)));
    if (snap.empty) isUnique = true;
    else teamCode = generateTeamCode();
  }

  const teamId = generateId();
  const playerId = generateId();
  const now = Timestamp.now();

  const team = {
    teamId, teamName, teamCode,
    captainPlayerId: playerId,
    memberIds: [playerId],
    currentLevel: 1,
    level1QuestionIndex: 0,
    level1SubmittedAt: null,
    level1Answer: null,
    level1Correct: null,
    createdAt: now,
  };

  const player = {
    playerId, name: playerName, teamId, teamCode,
    isCaptain: true,
    currentLevel: 1,
    currentQuestionIndex: 0,
    score: 0,
    level2SubmittedAt: null,
    level3SubmittedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'teams', teamId), team);
  await setDoc(doc(db, 'players', playerId), player);
  return { team, player };
}

export async function joinTeam(playerName, teamCode) {
  const snap = await getDocs(query(collection(db, 'teams'), where('teamCode', '==', teamCode.toUpperCase())));
  if (snap.empty) throw new Error('Team not found. Check the code and try again.');

  const team = snap.docs[0].data();
  const playerId = generateId();
  const now = Timestamp.now();

  const player = {
    playerId, name: playerName, teamId: team.teamId, teamCode: team.teamCode,
    isCaptain: false,
    currentLevel: 1,
    currentQuestionIndex: 0,
    score: 0,
    level2SubmittedAt: null,
    level3SubmittedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'players', playerId), player);
  // arrayUnion prevents race condition when multiple players join simultaneously
  await updateDoc(doc(db, 'teams', team.teamId), { memberIds: arrayUnion(playerId) });
  return { team: { ...team, memberIds: [...team.memberIds, playerId] }, player };
}

export async function getPlayer(playerId) {
  const snap = await getDoc(doc(db, 'players', playerId));
  return snap.exists() ? snap.data() : null;
}

export async function getTeam(teamId) {
  const snap = await getDoc(doc(db, 'teams', teamId));
  return snap.exists() ? snap.data() : null;
}

// ── Game Control ──────────────────────────────────────────────────────────────

export async function startGame() {
  const gameStartTime = Timestamp.now();
  const gameEndTime = Timestamp.fromMillis(gameStartTime.toMillis() + 5 * 60 * 1000);
  await updateDoc(doc(db, 'gameState', 'current'), {
    phase: 'live', gameStartTime, gameEndTime, updatedAt: serverTimestamp(),
  });
  await addDoc(collection(db, 'activity'), {
    type: 'game_started', message: 'Game has started!', createdAt: serverTimestamp(),
  });
}

export async function endGame() {
  await updateDoc(doc(db, 'gameState', 'current'), { phase: 'ended', updatedAt: serverTimestamp() });
  await addDoc(collection(db, 'activity'), {
    type: 'game_ended', message: 'Game has ended!', createdAt: serverTimestamp(),
  });
}

export async function resetGame() {
  const batch = writeBatch(db);
  const cols = ['teams', 'players', 'answers', 'activity'];
  for (const col of cols) {
    const snap = await getDocs(collection(db, col));
    snap.forEach(d => batch.delete(d.ref));
  }
  batch.update(doc(db, 'gameState', 'current'), {
    phase: 'lobby', gameStartTime: null, gameEndTime: null, updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

// ── Submit Answers ────────────────────────────────────────────────────────────

export async function submitLevel1(teamId, playerId, selectedOption, questionIndex) {
  const snap = await getDocs(
    query(collection(db, 'questions'), where('level', '==', 1), where('questionIndex', '==', questionIndex), limit(1))
  );
  if (snap.empty) throw new Error('Question not found');

  const question = snap.docs[0].data();
  const isCorrect = question.inputType === 'text'
    ? selectedOption.trim().toLowerCase() === question.correctOption.trim().toLowerCase()
    : selectedOption === question.correctOption;
  const awardedPoints = isCorrect ? 35 : 0;

  const teamSnap = await getDoc(doc(db, 'teams', teamId));
  const team = teamSnap.data();
  const isLastQuestion = questionIndex === 2;
  const batch = writeBatch(db);

  if (isLastQuestion) {
    batch.update(doc(db, 'teams', teamId), {
      currentLevel: 2, level1QuestionIndex: 3,
      level1SubmittedAt: serverTimestamp(),
      level1Answer: selectedOption, level1Correct: isCorrect,
    });
    for (const memberId of team.memberIds) {
      batch.update(doc(db, 'players', memberId), {
        currentLevel: 2, currentQuestionIndex: 0,
        score: increment(awardedPoints), updatedAt: serverTimestamp(),
      });
    }
    const actRef = doc(collection(db, 'activity'), generateId());
    batch.set(actRef, {
      activityId: actRef.id, type: 'team_advanced',
      message: `Team ${team.teamName} completed Level 1 and moved to Level 2!`,
      createdAt: serverTimestamp(),
    });
  } else {
    batch.update(doc(db, 'teams', teamId), { level1QuestionIndex: questionIndex + 1 });
    for (const memberId of team.memberIds) {
      batch.update(doc(db, 'players', memberId), {
        score: increment(awardedPoints), updatedAt: serverTimestamp(),
      });
    }
  }

  const ansRef = doc(collection(db, 'answers'), generateId());
  batch.set(ansRef, {
    answerId: ansRef.id, ownerType: 'team', ownerId: teamId,
    teamId, playerId: null, level: 1, questionIndex,
    selectedOption, mode: null, submittedAt: serverTimestamp(), isCorrect, awardedPoints,
  });
  await batch.commit();
}

export async function submitLevel2(playerId, selectedOption, mode, questionIndex) {
  const snap = await getDocs(
    query(collection(db, 'questions'), where('level', '==', 2), where('questionIndex', '==', questionIndex), limit(1))
  );
  if (snap.empty) throw new Error('Question not found');

  const question = snap.docs[0].data();
  const isCorrect = selectedOption === question.correctOption;
  const awardedPoints = mode === 'safe'
    ? (isCorrect ? 15 : 0)
    : (isCorrect ? 30 : -10);

  const playerSnap = await getDoc(doc(db, 'players', playerId));
  const player = playerSnap.data();
  const isLastQuestion = questionIndex === 2;
  const batch = writeBatch(db);

  if (isLastQuestion) {
    batch.update(doc(db, 'players', playerId), {
      currentLevel: 3, currentQuestionIndex: 0,
      score: increment(awardedPoints), level2SubmittedAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    const actRef = doc(collection(db, 'activity'), generateId());
    batch.set(actRef, {
      activityId: actRef.id, type: 'player_advanced',
      message: `${player.name} moved to Level 3`, createdAt: serverTimestamp(),
    });
  } else {
    batch.update(doc(db, 'players', playerId), {
      currentQuestionIndex: questionIndex + 1,
      score: increment(awardedPoints), updatedAt: serverTimestamp(),
    });
  }

  const ansRef = doc(collection(db, 'answers'), generateId());
  batch.set(ansRef, {
    answerId: ansRef.id, ownerType: 'player', ownerId: playerId,
    teamId: player.teamId, playerId, level: 2, questionIndex,
    selectedOption, mode, submittedAt: serverTimestamp(), isCorrect, awardedPoints,
  });
  await batch.commit();
}

export async function submitLevel3(playerId, selectedOption, questionIndex) {
  const snap = await getDocs(
    query(collection(db, 'questions'), where('level', '==', 3), where('questionIndex', '==', questionIndex), limit(1))
  );
  if (snap.empty) throw new Error('Question not found');

  const question = snap.docs[0].data();
  const isCorrect = selectedOption === question.correctOption;

  const playerSnap = await getDoc(doc(db, 'players', playerId));
  const player = playerSnap.data();

  let awardedPoints = 0;
  if (isCorrect) {
    const rankSnap = await getDocs(
      query(collection(db, 'answers'), where('level', '==', 3),
        where('questionIndex', '==', questionIndex), where('isCorrect', '==', true),
        orderBy('submittedAt', 'asc'))
    );
    const rank = rankSnap.size + 1;
    awardedPoints = rank === 1 ? 35 : rank === 2 ? 30 : rank === 3 ? 25 : 20;
  }

  const isLastQuestion = questionIndex === 2;
  const batch = writeBatch(db);

  if (isLastQuestion) {
    batch.update(doc(db, 'players', playerId), {
      currentLevel: 'finished', score: increment(awardedPoints),
      level3SubmittedAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    const actRef = doc(collection(db, 'activity'), generateId());
    batch.set(actRef, {
      activityId: actRef.id, type: 'player_finished',
      message: `${player.name} finished the game!`, createdAt: serverTimestamp(),
    });
  } else {
    batch.update(doc(db, 'players', playerId), {
      currentQuestionIndex: questionIndex + 1,
      score: increment(awardedPoints), updatedAt: serverTimestamp(),
    });
  }

  const ansRef = doc(collection(db, 'answers'), generateId());
  batch.set(ansRef, {
    answerId: ansRef.id, ownerType: 'player', ownerId: playerId,
    teamId: player.teamId, playerId, level: 3, questionIndex,
    selectedOption, mode: null, submittedAt: serverTimestamp(), isCorrect, awardedPoints,
  });
  await batch.commit();
}

// ── Seed Questions ────────────────────────────────────────────────────────────

export async function seedQuestions() {
  const questions = [
    // Level 1 – Team Up
    { level: 1, questionIndex: 0, inputType: 'text',
      prompt: '🔤 Unscramble this teamwork word:\n\nRTAABOOLCLONI\n\nHint: A key ingredient for great teams.',
      options: null, correctOption: 'Collaboration' },
    { level: 1, questionIndex: 1, inputType: 'text',
      prompt: '🧩 Puzzle Together\n\nArrange these words into a meaningful teamwork quote:\n\n"None / of / us / as / smart / as / all / of / us"',
      options: null, correctOption: 'None of us is as smart as all of us' },
    { level: 1, questionIndex: 2, inputType: 'choice',
      prompt: 'During a group project, everyone has different ideas about how to solve a problem.\n\nWhat is the best team approach?',
      options: ['A. Choose the first idea suggested', 'B. Discuss all ideas and decide together',
        'C. Let one person decide everything', 'D. Split into smaller groups immediately'],
      correctOption: 'B. Discuss all ideas and decide together' },
    // Level 2 – Be Bold
    { level: 2, questionIndex: 0, inputType: 'choice',
      prompt: 'You have a new idea that could improve a process but might fail.\n\nWhat does "Be Bold" encourage you to do?',
      options: ['A. Ignore it', 'B. Wait until someone else tries',
        'C. Share and experiment with the idea', 'D. Keep it secret'],
      correctOption: 'C. Share and experiment with the idea' },
    { level: 2, questionIndex: 1, inputType: 'choice',
      prompt: 'Who said: "Stay hungry, stay foolish."',
      options: ['A. Elon Musk', 'B. Steve Jobs', 'C. Bill Gates', 'D. Mark Zuckerberg'],
      correctOption: 'B. Steve Jobs' },
    { level: 2, questionIndex: 2, inputType: 'choice',
      prompt: 'During a meeting, you have an idea that could improve the project, but the discussion is moving fast.\n\nWhat is the best bold action?',
      options: ['A. Share the idea and briefly explain the benefit',
        'B. Wait until the meeting ends to mention it privately',
        'C. Write it down for later and see if someone else says it',
        'D. Observe the discussion before deciding'],
      correctOption: 'A. Share the idea and briefly explain the benefit' },
    // Level 3 – Deliver Value
    { level: 3, questionIndex: 0, inputType: 'choice',
      prompt: 'Which of these best represents Delivering Value?',
      options: ['A. Completing work quickly', 'B. Completing work that actually helps the customer',
        'C. Doing the easiest task', 'D. Finishing only assigned work'],
      correctOption: 'B. Completing work that actually helps the customer' },
    { level: 3, questionIndex: 1, inputType: 'choice',
      prompt: 'Which person delivers the most value to society?',
      options: ['A. Someone who solves problems for others', 'B. Someone who complains all day',
        'C. Someone who avoids responsibility', 'D. Someone who wastes time'],
      correctOption: 'A. Someone who solves problems for others' },
    { level: 3, questionIndex: 2, inputType: 'choice',
      prompt: 'A restaurant notices customers complain about slow service, not the food. Instead of changing the menu, they improve the order and serving process, reducing waiting time from 20 minutes to 5 minutes.\n\nWhat value did they deliver?',
      options: ['A. Better taste', 'B. Faster service and better customer experience',
        'C. Lower food quality', 'D. More menu items'],
      correctOption: 'B. Faster service and better customer experience' },
  ];

  const batch = writeBatch(db);
  for (const q of questions) {
    const existing = await getDocs(
      query(collection(db, 'questions'), where('level', '==', q.level), where('questionIndex', '==', q.questionIndex))
    );
    if (existing.empty) {
      const questionId = generateId();
      batch.set(doc(db, 'questions', questionId), { questionId, ...q });
    }
  }
  await batch.commit();
}
