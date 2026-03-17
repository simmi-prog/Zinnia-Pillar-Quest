import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBZFRLGl2xZA7JBIvd0pLg5vtR3h2xibz0",
  authDomain: "zinnia-values-game.firebaseapp.com",
  projectId: "zinnia-values-game",
  storageBucket: "zinnia-values-game.firebasestorage.app",
  messagingSenderId: "411543951710",
  appId: "1:411543951710:web:3acbeaeb010d00fa5b17cf",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
