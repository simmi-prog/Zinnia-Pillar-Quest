import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
  Timestamp,
  increment,
  addDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { generateTeamCode, generateId } from "./utils";
import type {
  GameState,
  Team,
  Player,
  Answer,
  Activity,
  Question,
  LeaderboardEntry,
  Level,
  Mode,
} from "./types";

export async function getGameState(): Promise<GameState | null> {
  const docRef = doc(db, "gameState", "current");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as GameState) : null;
}

export async function initializeGameState() {
  const docRef = doc(db, "gameState", "current");
  const existing = await getDoc(docRef);
  if (!existing.exists()) {
    await setDoc(docRef, {
      phase: "lobby",
      gameStartTime: null,
      gameEndTime: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function createTeam(
  teamName: string,
  playerName: string
): Promise<{ team: Team; player: Player }> {
  let teamCode = generateTeamCode();
  let isUnique = false;

  while (!isUnique) {
    const q = query(collection(db, "teams"), where("teamCode", "==", teamCode));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      isUnique = true;
    } else {
      teamCode = generateTeamCode();
    }
  }

  const teamId = generateId();
  const playerId = generateId();

  const team: Team = {
    teamId,
    teamName,
    teamCode,
    captainPlayerId: playerId,
    memberIds: [playerId],
    currentLevel: 1,
    level1SubmittedAt: null,
    level1Answer: null,
    level1Correct: null,
    createdAt: Timestamp.now(),
  };

  const player: Player = {
    playerId,
    name: playerName,
    teamId,
    teamCode,
    isCaptain: true,
    currentLevel: 1,
    score: 0,
    level2SubmittedAt: null,
    level3SubmittedAt: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(doc(db, "teams", teamId), team);
  await setDoc(doc(db, "players", playerId), player);

  return { team, player };
}

export async function joinTeam(
  playerName: string,
  teamCode: string
): Promise<{ team: Team; player: Player }> {
  const q = query(collection(db, "teams"), where("teamCode", "==", teamCode.toUpperCase()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Team not found");
  }

  const teamDoc = snapshot.docs[0];
  const team = teamDoc.data() as Team;

  const playerId = generateId();

  const player: Player = {
    playerId,
    name: playerName,
    teamId: team.teamId,
    teamCode: team.teamCode,
    isCaptain: false,
    currentLevel: 1,
    score: 0,
    level2SubmittedAt: null,
    level3SubmittedAt: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(doc(db, "players", playerId), player);
  await updateDoc(doc(db, "teams", team.teamId), {
    memberIds: [...team.memberIds, playerId],
  });

  return { team: { ...team, memberIds: [...team.memberIds, playerId] }, player };
}

export async function startGame() {
  const gameStartTime = Timestamp.now();
  const gameEndTime = Timestamp.fromMillis(gameStartTime.toMillis() + 5 * 60 * 1000);

  await updateDoc(doc(db, "gameState", "current"), {
    phase: "live",
    gameStartTime,
    gameEndTime,
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "activity"), {
    type: "game_started",
    message: "Game has started!",
    createdAt: serverTimestamp(),
  });
}

export async function endGame() {
  await updateDoc(doc(db, "gameState", "current"), {
    phase: "ended",
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "activity"), {
    type: "game_ended",
    message: "Game has ended!",
    createdAt: serverTimestamp(),
  });
}

export async function submitLevel1(
  teamId: string,
  playerId: string,
  selectedOption: string
): Promise<void> {
  const q = query(collection(db, "questions"), where("level", "==", 1), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("No Level 1 question found");
  }

  const question = snapshot.docs[0].data() as Question;
  const isCorrect = selectedOption === question.correctOption;
  const awardedPoints = isCorrect ? 35 : 0;

  const teamRef = doc(db, "teams", teamId);
  const teamDoc = await getDoc(teamRef);
  const team = teamDoc.data() as Team;

  const batch = writeBatch(db);

  batch.update(teamRef, {
    currentLevel: 2,
    level1SubmittedAt: serverTimestamp(),
    level1Answer: selectedOption,
    level1Correct: isCorrect,
  });

  for (const memberId of team.memberIds) {
    const playerRef = doc(db, "players", memberId);
    batch.update(playerRef, {
      currentLevel: 2,
      score: increment(awardedPoints),
      updatedAt: serverTimestamp(),
    });
  }

  const answerRef = doc(collection(db, "answers"), generateId());
  batch.set(answerRef, {
    answerId: answerRef.id,
    ownerType: "team",
    ownerId: teamId,
    teamId,
    playerId: null,
    level: 1,
    selectedOption,
    mode: null,
    submittedAt: serverTimestamp(),
    isCorrect,
    awardedPoints,
  });

  const activityRef = doc(collection(db, "activity"), generateId());
  batch.set(activityRef, {
    activityId: activityRef.id,
    type: "team_advanced",
    message: `Team ${team.teamName} moved to Level 2`,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function submitLevel2(
  playerId: string,
  selectedOption: string,
  mode: "safe" | "bold"
): Promise<void> {
  const q = query(collection(db, "questions"), where("level", "==", 2), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("No Level 2 question found");
  }

  const question = snapshot.docs[0].data() as Question;
  const isCorrect = selectedOption === question.correctOption;

  let awardedPoints = 0;
  if (mode === "safe") {
    awardedPoints = isCorrect ? 15 : 0;
  } else {
    awardedPoints = isCorrect ? 30 : -10;
  }

  const playerRef = doc(db, "players", playerId);
  const playerDoc = await getDoc(playerRef);
  const player = playerDoc.data() as Player;

  const batch = writeBatch(db);

  batch.update(playerRef, {
    currentLevel: 3,
    score: increment(awardedPoints),
    level2SubmittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const answerRef = doc(collection(db, "answers"), generateId());
  batch.set(answerRef, {
    answerId: answerRef.id,
    ownerType: "player",
    ownerId: playerId,
    teamId: player.teamId,
    playerId,
    level: 2,
    selectedOption,
    mode,
    submittedAt: serverTimestamp(),
    isCorrect,
    awardedPoints,
  });

  const activityRef = doc(collection(db, "activity"), generateId());
  batch.set(activityRef, {
    activityId: activityRef.id,
    type: "player_advanced",
    message: `${player.name} moved to Level 3`,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function submitLevel3(playerId: string, selectedOption: string): Promise<void> {
  const q = query(collection(db, "questions"), where("level", "==", 3), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("No Level 3 question found");
  }

  const question = snapshot.docs[0].data() as Question;
  const isCorrect = selectedOption === question.correctOption;

  const playerRef = doc(db, "players", playerId);
  const playerDoc = await getDoc(playerRef);
  const player = playerDoc.data() as Player;

  let awardedPoints = 0;
  if (isCorrect) {
    const answersQuery = query(
      collection(db, "answers"),
      where("level", "==", 3),
      where("isCorrect", "==", true),
      orderBy("submittedAt", "asc")
    );
    const answersSnapshot = await getDocs(answersQuery);

    const rank = answersSnapshot.size + 1;
    if (rank === 1) {
      awardedPoints = 35;
    } else if (rank === 2) {
      awardedPoints = 30;
    } else if (rank === 3) {
      awardedPoints = 25;
    } else {
      awardedPoints = 20;
    }
  }

  const batch = writeBatch(db);

  batch.update(playerRef, {
    currentLevel: "finished",
    score: increment(awardedPoints),
    level3SubmittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const answerRef = doc(collection(db, "answers"), generateId());
  batch.set(answerRef, {
    answerId: answerRef.id,
    ownerType: "player",
    ownerId: playerId,
    teamId: player.teamId,
    playerId,
    level: 3,
    selectedOption,
    mode: null,
    submittedAt: serverTimestamp(),
    isCorrect,
    awardedPoints,
  });

  const activityRef = doc(collection(db, "activity"), generateId());
  batch.set(activityRef, {
    activityId: activityRef.id,
    type: "player_finished",
    message: `${player.name} finished the game!`,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function resetGame() {
  const batch = writeBatch(db);

  const teams = await getDocs(collection(db, "teams"));
  teams.forEach((doc) => batch.delete(doc.ref));

  const players = await getDocs(collection(db, "players"));
  players.forEach((doc) => batch.delete(doc.ref));

  const answers = await getDocs(collection(db, "answers"));
  answers.forEach((doc) => batch.delete(doc.ref));

  const activity = await getDocs(collection(db, "activity"));
  activity.forEach((doc) => batch.delete(doc.ref));

  batch.update(doc(db, "gameState", "current"), {
    phase: "lobby",
    gameStartTime: null,
    gameEndTime: null,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function getTeamByCode(teamCode: string): Promise<Team | null> {
  const q = query(collection(db, "teams"), where("teamCode", "==", teamCode.toUpperCase()));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : (snapshot.docs[0].data() as Team);
}

export async function getPlayer(playerId: string): Promise<Player | null> {
  const docRef = doc(db, "players", playerId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Player) : null;
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const docRef = doc(db, "teams", teamId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Team) : null;
}

export async function seedQuestions() {
  const questions: Omit<Question, "questionId">[] = [
    {
      level: 1,
      prompt: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctOption: "Paris",
    },
    {
      level: 2,
      prompt: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctOption: "Mars",
    },
    {
      level: 3,
      prompt: "What is 15 x 12?",
      options: ["170", "180", "190", "200"],
      correctOption: "180",
    },
  ];

  const batch = writeBatch(db);

  for (const q of questions) {
    const existingQuery = query(collection(db, "questions"), where("level", "==", q.level));
    const snapshot = await getDocs(existingQuery);

    if (snapshot.empty) {
      const questionId = generateId();
      const docRef = doc(db, "questions", questionId);
      batch.set(docRef, {
        questionId,
        ...q,
      });
    }
  }

  await batch.commit();
}
