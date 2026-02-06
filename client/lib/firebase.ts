import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7KlxN05OoSCGHwjXhiiYyKF5bOXianLY",
  authDomain: "keysystem-d0b86-8df89.firebaseapp.com",
  projectId: "keysystem-d0b86-8df89",
  storageBucket: "keysystem-d0b86-8df89.firebasestorage.app",
  messagingSenderId: "1048409565735",
  appId: "1:1048409565735:web:5a9f5422826949490dfc02",
  measurementId: "G-GK1R043YTV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

export { app };
