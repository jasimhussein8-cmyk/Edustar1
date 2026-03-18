import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as firebaseSignIn, 
  createUserWithEmailAndPassword as firebaseCreateUser,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc as firestoreDoc, 
  setDoc as firestoreSetDoc, 
  getDoc as firestoreGetDoc, 
  collection as firestoreCollection, 
  query as firestoreQuery, 
  where as firestoreWhere, 
  getDocs as firestoreGetDocs,
  onSnapshot as firestoreOnSnapshot,
  addDoc as firestoreAddDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  Timestamp as firestoreTimestamp,
  getDocFromServer as firestoreGetDocFromServer
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

// Error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Wrappers
export const signInWithEmailAndPassword = firebaseSignIn;
export const createUserWithEmailAndPassword = firebaseCreateUser;
export const signOut = firebaseSignOut;
export const onAuthStateChanged = firebaseOnAuthStateChanged;

export const doc = firestoreDoc;
export const collection = firestoreCollection;
export const query = firestoreQuery;
export const where = firestoreWhere;
export const orderBy = firestoreOrderBy;
export const limit = firestoreLimit;
export const Timestamp = firestoreTimestamp;

export const getDoc = async (docRef: any) => {
  try {
    return await firestoreGetDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docRef.path);
  }
};

export const setDoc = async (docRef: any, data: any) => {
  try {
    return await firestoreSetDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docRef.path);
  }
};

export const addDoc = async (colRef: any, data: any) => {
  try {
    return await firestoreAddDoc(colRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, colRef.path);
  }
};

export const updateDoc = async (docRef: any, data: any) => {
  try {
    return await firestoreUpdateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docRef.path);
  }
};

export const deleteDoc = async (docRef: any) => {
  try {
    return await firestoreDeleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docRef.path);
  }
};

export const getDocs = async (queryObj: any) => {
  try {
    return await firestoreGetDocs(queryObj);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, null);
  }
};

export const onSnapshot = (ref: any, callback: any, errorCallback?: any) => {
  return firestoreOnSnapshot(ref, callback, (error) => {
    if (errorCallback) {
      errorCallback(error);
    } else {
      handleFirestoreError(error, OperationType.GET, null);
    }
  });
};

export const getDocFromServer = async (docRef: any) => {
  try {
    return await firestoreGetDocFromServer(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docRef.path);
  }
};

// Storage Wrappers
export const storageRef = ref;
export const uploadFile = async (path: string, file: Blob | Uint8Array | ArrayBuffer) => {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

export const deleteFile = async (path: string) => {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
};

export default app;
