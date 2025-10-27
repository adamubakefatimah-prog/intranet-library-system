import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from './firebase';

export async function createUserProfile(uid, data, role = 'user') {
  const ref = doc(firestore, 'users', uid);

  const payload =
    typeof data === 'object'
      ? {
          uid,
          email: data.email,
          fullName: data.fullName || '',
          userId: data.userId || '',
          role: data.role || role,
          createdAt: new Date(),
        }
      : {
          uid,
          email: data,
          role,
          createdAt: new Date(),
        };

  await setDoc(ref, payload);
}

export async function getUserProfile(uid) {
  if (!uid) return null;
  const ref = doc(firestore, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
