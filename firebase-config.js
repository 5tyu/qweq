// firebase-config.js — Taha's Counter Firebase Configuration
// This file is imported by both index.html and admin.html

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMw0DoMDycNvqpAZFBTuxDuMNcZ50MAQc",
  authDomain: "performance-counter.firebaseapp.com",
  databaseURL: "https://performance-counter-default-rtdb.firebaseio.com",
  projectId: "performance-counter",
  storageBucket: "performance-counter.firebasestorage.app",
  messagingSenderId: "605140364499",
  appId: "1:605140364499:web:2cdaec7a04f1e57678b826",
  measurementId: "G-7H5SNPN646"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export default app;
