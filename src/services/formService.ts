import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { FormTemplate } from '../types';
import { INITIAL_FORM_TEMPLATE } from '../lib/defaultFormTemplate';

const COLLECTION_NAME = 'formTemplates';
const VERSION_COLLECTION = 'formVersions';

export async function getActiveFormTemplate(): Promise<FormTemplate> {
  try {
    const docRef = doc(db, COLLECTION_NAME, INITIAL_FORM_TEMPLATE.id);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data() as FormTemplate;
    }

    // Initialize with default template in Firestore if not yet saved
    try {
      await setDoc(docRef, INITIAL_FORM_TEMPLATE);
    } catch {
      // If client cannot write directly, fallback to initial memory template
    }
    return INITIAL_FORM_TEMPLATE;
  } catch (error) {
    console.warn('Using local default template due to Firestore read state:', error);
    return INITIAL_FORM_TEMPLATE;
  }
}

export async function saveFormTemplateDraft(template: FormTemplate): Promise<void> {
  try {
    const draftTemplate: FormTemplate = {
      ...template,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'formDrafts', template.id), draftTemplate);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${template.id}`);
  }
}

export async function publishFormTemplate(template: FormTemplate): Promise<FormTemplate> {
  try {
    const published: FormTemplate = {
      ...template,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Retain an immutable version snapshot before updating the active pointer.
    const versionId = `${template.id}__${published.version.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const historical = await getDoc(doc(db, VERSION_COLLECTION, versionId));
    if (historical.exists()) throw new Error('This version has already been published.');
    await setDoc(doc(db, VERSION_COLLECTION, versionId), published);
    await setDoc(doc(db, COLLECTION_NAME, template.id), published);
    return published;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${template.id}`);
    return template;
  }
}

export async function listAllFormTemplates(): Promise<FormTemplate[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (snap.empty) {
      return [INITIAL_FORM_TEMPLATE];
    }
    return snap.docs.map((d) => d.data() as FormTemplate);
  } catch (error) {
    console.warn('Using in-memory templates:', error);
    return [INITIAL_FORM_TEMPLATE];
  }
}
