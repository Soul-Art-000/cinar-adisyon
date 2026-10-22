import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKFAPpffjLGSN9LoCw_ZbcFBLmNQq0R50",
  authDomain: "adisyo-9727e.firebaseapp.com",
  projectId: "adisyo-9727e",
  storageBucket: "adisyo-9727e.firebasestorage.app",
  messagingSenderId: "824306450324",
  appId: "1:824306450324:web:c47455813a27c0919d9981"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
