// firebase.ts  (loyiha rootida)

// Firebase SDK'dan kerakli modullar
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Analytics kerak bo'lsa, quyidagini keyin ishlatasiz:
// import { getAnalytics } from 'firebase/analytics';

// Siz yuborgan config
const firebaseConfig = {
  apiKey: 'AIzaSyAvztWEtYm5zdGM8ZipjGHKJHzr8PQyeZA',
  authDomain: 'pureclean-laundry.firebaseapp.com',
  projectId: 'pureclean-laundry',
  storageBucket: 'pureclean-laundry.firebasestorage.app',
  messagingSenderId: '876150826184',
  appId: '1:876150826184:web:b5020cc7008ddab14b31fd',
  measurementId: 'G-R7FB8FZ4PF',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ❗ MUHIM: Firestore instance'ni chiqaramiz
export const db = getFirestore(app);

// Analytics ishlatmoqchi bo'lsangiz, faqat browserda chaqiring.
// Vite/SSRda xato bermasligi uchun shunday yozish ma'qul:
// if (typeof window !== 'undefined') {
//   const analytics = getAnalytics(app);
// }