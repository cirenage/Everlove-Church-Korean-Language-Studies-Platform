import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Instructor } from '../types';

const COLLECTION_NAME = 'instructors';

export async function getAllInstructors(): Promise<Instructor[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    return snap.docs.map((d) => d.data() as Instructor);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return [];
  }
}

export async function getInstructorById(id: string): Promise<Instructor | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, id));
    if (snap.exists()) {
      return snap.data() as Instructor;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${id}`);
    return null;
  }
}

export async function createInstructor(instructorData: Omit<Instructor, 'id' | 'createdAt'>): Promise<Instructor> {
  const id = `inst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const instructor: Instructor = {
    ...instructorData,
    id,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COLLECTION_NAME, id), instructor);
    return instructor;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${id}`);
    return instructor;
  }
}

export async function updateInstructor(id: string, updates: Partial<Instructor>): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteInstructor(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}
