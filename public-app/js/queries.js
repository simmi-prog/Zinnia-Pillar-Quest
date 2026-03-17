import {
  collection, doc, getDoc, getDocs, query, where, limit, orderBy, onSnapshot,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { db } from './firebase-config.js';

export async function getQuestion(level, questionIndex) {
  const snap = await getDocs(
    query(collection(db, 'questions'), where('level', '==', level), where('questionIndex', '==', questionIndex), limit(1))
  );
  return snap.empty ? null : snap.docs[0].data();
}

export async function getTeamMembers(teamId) {
  const snap = await getDocs(query(collection(db, 'players'), where('teamId', '==', teamId)));
  return snap.docs.map(d => d.data());
}

export async function getAllPlayers() {
  const snap = await getDocs(collection(db, 'players'));
  return snap.docs.map(d => d.data());
}

export async function getAllTeams() {
  const snap = await getDocs(collection(db, 'teams'));
  return snap.docs.map(d => d.data());
}

export function computeLeaderboard(players, teams) {
  const teamsMap = {};
  teams.forEach(t => (teamsMap[t.teamId] = t));

  const entries = players.map(p => ({
    playerId: p.playerId,
    name: p.name,
    teamName: teamsMap[p.teamId]?.teamName || 'Unknown',
    score: p.score,
    level: p.currentLevel,
    level2SubmittedAt: p.level2SubmittedAt || null,
    level3SubmittedAt: p.level3SubmittedAt || null,
  }));

  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aL3 = a.level3SubmittedAt?.toMillis() ?? Infinity;
    const bL3 = b.level3SubmittedAt?.toMillis() ?? Infinity;
    if (aL3 !== bL3) return aL3 - bL3;
    const aL2 = a.level2SubmittedAt?.toMillis() ?? Infinity;
    const bL2 = b.level2SubmittedAt?.toMillis() ?? Infinity;
    return aL2 - bL2;
  });

  return entries;
}

export function subscribeGameState(callback) {
  return onSnapshot(doc(db, 'gameState', 'current'), snap => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export function subscribePlayers(callback) {
  return onSnapshot(collection(db, 'players'), snap => {
    callback(snap.docs.map(d => d.data()));
  });
}

export function subscribeTeams(callback) {
  return onSnapshot(collection(db, 'teams'), snap => {
    callback(snap.docs.map(d => d.data()));
  });
}

export function subscribePlayer(playerId, callback) {
  return onSnapshot(doc(db, 'players', playerId), snap => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export function subscribeTeam(teamId, callback) {
  return onSnapshot(doc(db, 'teams', teamId), snap => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export function subscribeActivity(callback) {
  return onSnapshot(
    query(collection(db, 'activity'), orderBy('createdAt', 'desc'), limit(10)),
    snap => callback(snap.docs.map(d => d.data()))
  );
}
