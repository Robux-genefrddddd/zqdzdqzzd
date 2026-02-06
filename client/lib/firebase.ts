import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7tZowGRZtWEtUMq_Dc0QlFc2dH59inJ8",
  authDomain: "vostockfr-3b08c.firebaseapp.com",
  projectId: "vostockfr-3b08c",
  storageBucket: "vostockfr-3b08c.firebasestorage.app",
  messagingSenderId: "170484032487",
  appId: "1:170484032487:web:004296664b747b9b1c1342",
  measurementId: "G-W0SPPR2MC9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

export { app };
