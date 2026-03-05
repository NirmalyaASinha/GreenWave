import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyAqmnY4i0SJ4ImtLMFcme8m1NH2siFD3pw",
  authDomain: "greenwave-e1768.firebaseapp.com",
  databaseURL: "https://greenwave-e1768-default-rtdb.firebaseio.com",
  projectId: "greenwave-e1768",
  storageBucket: "greenwave-e1768.firebasestorage.app",
  messagingSenderId: "10111045068",
  appId: "1:10111045068:web:ca9e7baa45c3772129a169",
  measurementId: "G-3BL3HXW0LB",
}

export const app = initializeApp(firebaseConfig)
export const database = firebaseConfig.databaseURL ? getDatabase(app) : null
export const firestore = getFirestore(app)
export const db = firestore  // Alias for firestore
export const auth = getAuth(app)
export const analytics =
  typeof window !== 'undefined'
    ? isSupported()
        .then((supported) => (supported ? getAnalytics(app) : null))
        .catch(() => null)
    : null
