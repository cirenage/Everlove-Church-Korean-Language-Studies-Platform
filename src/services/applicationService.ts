import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  deleteDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Application, ApplicationStatus, ApplicationHistoryEvent } from '../types';

const COLLECTION_NAME = 'applications';

export function generateReferenceNumber(isDemo = false): string {
  const prefix = isDemo ? 'SAMPLE-EL-2026' : 'EL-2026';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

export async function submitApplication(
  appData: Omit<Application, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'history'> & {
    id?: string;
    referenceNumber?: string;
  }
): Promise<Application> {
  const appId = appData.id || `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const reference = appData.referenceNumber || generateReferenceNumber(appData.isDemo);
  const now = new Date().toISOString();

  const newApplication: Application = {
    ...appData,
    id: appId,
    referenceNumber: reference,
    status: appData.status || 'submitted',
    createdAt: now,
    updatedAt: now,
    history: [
      {
        timestamp: now,
        action: 'Application Submitted',
        actorName: `${appData.applicant.givenName} ${appData.applicant.familyName}`,
        note: 'Submitted via Everlove Korean Studies online portal',
      },
    ],
  };

  try {
    await setDoc(doc(db, COLLECTION_NAME, appId), newApplication);
    return newApplication;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${appId}`);
    return newApplication;
  }
}

export async function getApplicationById(id: string): Promise<Application | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, id));
    if (snap.exists()) {
      return snap.data() as Application;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${id}`);
    return null;
  }
}

export async function getAllApplications(): Promise<Application[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Application);
  } catch (error) {
    console.warn('Could not fetch applications via query, trying fallback collection read:', error);
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      return snap.docs.map((d) => d.data() as Application);
    } catch (e) {
      console.error('Error fetching applications:', e);
      return [];
    }
  }
}

export async function updateApplicationStatus(
  id: string,
  newStatus: ApplicationStatus,
  actorName: string,
  note?: string
): Promise<void> {
  const now = new Date().toISOString();
  try {
    const appDocRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(appDocRef);
    if (!snap.exists()) throw new Error('Application not found');

    const app = snap.data() as Application;
    const historyEvent: ApplicationHistoryEvent = {
      timestamp: now,
      action: `Status changed to ${newStatus.replace('_', ' ').toUpperCase()}`,
      actorName,
      note,
    };

    const updatedHistory = [...(app.history || []), historyEvent];

    await updateDoc(appDocRef, {
      status: newStatus,
      updatedAt: now,
      history: updatedHistory,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function updateApplicationNotes(
  id: string,
  internalNotes: string,
  actorName: string
): Promise<void> {
  const now = new Date().toISOString();
  try {
    const appDocRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(appDocRef);
    if (!snap.exists()) throw new Error('Application not found');

    const app = snap.data() as Application;
    const historyEvent: ApplicationHistoryEvent = {
      timestamp: now,
      action: 'Administrative review notes updated',
      actorName,
    };

    await updateDoc(appDocRef, {
      internalNotes,
      updatedAt: now,
      history: [...(app.history || []), historyEvent],
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteApplication(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}
