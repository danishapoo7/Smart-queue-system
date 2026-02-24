import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging"; 
const firebaseConfig = {
  apiKey: "AIzaSyDDCQOHX-OhG_3u2FpnuqQjwshJaGU6pDs",
  authDomain: "queue-system-c3cd5.firebaseapp.com",
  projectId: "queue-system-c3cd5",
  storageBucket: "queue-system-c3cd5.firebasestorage.app",
  messagingSenderId: "495344832951",
  appId: "1:495344832951:web:77a341b50e8f41973c5832",
  measurementId: "G-NE5TBNKSNW"
};
    const app = initializeApp(firebaseConfig); 
    export const messaging = getMessaging(app);