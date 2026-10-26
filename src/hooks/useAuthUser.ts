import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

/** The signed-in Firebase user. Creates their `users/{uid}` profile on first sign-in. */
export function useAuthUser() {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) return;
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          // firestore.rules rejects null fields, so only include the ones that are set.
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...(firebaseUser.displayName ? { displayName: firebaseUser.displayName } : {}),
            ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL } : {}),
            createdAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('NexCart: could not create the user profile document.', error);
      }
    });
  }, []);

  return user;
}
