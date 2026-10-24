import { collection, doc, getDocs, setDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CommitteeFeedback, FeedbackStatus } from '../types';

const COLLECTION_NAME = 'committeeFeedback';

export async function submitCommitteeFeedback(
  reviewerName: string,
  screenOrFeature: string,
  status: FeedbackStatus,
  comment: string,
  isDemo = false
): Promise<CommitteeFeedback> {
  const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const feedback: CommitteeFeedback = {
    id,
    reviewerName: reviewerName.trim() || 'Committee Reviewer',
    screenOrFeature,
    status,
    comment,
    timestamp: new Date().toISOString(),
    isDemo,
  };

  try {
    await setDoc(doc(db, COLLECTION_NAME, id), feedback);
    return feedback;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${id}`);
    return feedback;
  }
}

export async function getAllCommitteeFeedback(): Promise<CommitteeFeedback[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as CommitteeFeedback);
  } catch (error) {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      return snap.docs.map((d) => d.data() as CommitteeFeedback);
    } catch (e) {
      console.error('Error fetching committee feedback:', e);
      return [];
    }
  }
}

export async function deleteCommitteeFeedback(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}
