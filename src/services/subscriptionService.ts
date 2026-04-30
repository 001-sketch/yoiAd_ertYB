import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export async function subscribe(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();
  const subId = normalizedEmail.replace(/[^a-z0-9]/g, '_');
  const subRef = doc(db, 'subscriptions', subId);

  try {
    await setDoc(subRef, {
      email: normalizedEmail,
      createdAt: serverTimestamp(),
      status: 'active',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `subscriptions/${subId}`);
  }
}
