import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCfgVk6mXBTFaf4C068qiR6qyjKmYxjwVU",
  authDomain: "gen-lang-client-0360134003.firebaseapp.com",
  projectId: "gen-lang-client-0360134003",
  storageBucket: "gen-lang-client-0360134003.firebasestorage.app",
  messagingSenderId: "992816807281",
  appId: "1:992816807281:web:dd0d095dbdf4b300a48ad0",
  measurementId: "G-6L3YQ0JM5R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

