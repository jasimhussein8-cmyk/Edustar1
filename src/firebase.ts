import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as firebaseSignIn, 
  createUserWithEmailAndPassword as firebaseCreateUser,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithPopup as firebaseSignInWithPopup,
  GoogleAuthProvider as firebaseGoogleAuthProvider
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
  deleteObject,
  uploadBytesResumable
} from 'firebase/storage';

import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Storage
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
export const signInWithPopup = firebaseSignInWithPopup;
export const GoogleAuthProvider = firebaseGoogleAuthProvider;

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

export const uploadFileWithProgress = (
  path: string, 
  file: File, 
  onProgress: (progress: number) => void
): Promise<string> => {
  console.log("Starting upload to path:", path, "File size:", file.size, "Bucket:", firebaseConfig.storageBucket);
  return new Promise((resolve, reject) => {
    try {
      if (!storage) {
        console.error("Firebase Storage is not initialized.");
        reject(new Error("Firebase Storage is not initialized. Please check your configuration."));
        return;
      }
      
      if (!auth.currentUser) {
        console.error("User is not authenticated.");
        reject(new Error("يجب تسجيل الدخول أولاً للقيام بعملية الرفع. يرجى إعادة تسجيل الدخول والمحاولة مرة أخرى."));
        return;
      }

      console.log(`Starting upload for user: ${auth.currentUser.uid}`);
      const fileRef = ref(storage, path);
      
      // For small files (< 512KB), try uploadBytes first as it's more direct and often more reliable
      if (file.size < 512 * 1024) {
        console.log("Small file detected, using uploadBytes for faster upload...");
        uploadBytes(fileRef, file).then(async (snapshot) => {
          console.log("Small file upload finished via uploadBytes");
          onProgress(100);
          const url = await getDownloadURL(snapshot.ref);
          resolve(url);
        }).catch(err => {
          console.error("uploadBytes failed, falling back to resumable:", err);
          startResumableUpload(fileRef, file, onProgress, resolve, reject);
        });
      } else {
        startResumableUpload(fileRef, file, onProgress, resolve, reject);
      }
    } catch (err) {
      console.error("Initiate upload error:", err);
      reject(err);
    }
  });
};

const startResumableUpload = (
  fileRef: any, 
  file: File, 
  onProgress: (progress: number) => void, 
  resolve: (url: string) => void, 
  reject: (error: any) => void
) => {
  const uploadTask = uploadBytesResumable(fileRef, file);

  // Set a safety timeout (increased to 600 seconds for slower connections)
  const timeout = setTimeout(() => {
    console.error("Upload timed out after 600 seconds.");
    uploadTask.cancel();
    reject(new Error("انتهت مهلة الرفع (600 ثانية). يرجى التحقق من اتصال الإنترنت أو إعدادات Firebase Storage. قد يكون الملف كبيراً جداً بالنسبة لسرعة الإنترنت الحالية."));
  }, 600000);

  let lastTransferred = 0;
  let lastUpdate = Date.now();

  uploadTask.on('state_changed', 
    (snapshot) => {
      console.log(`Snapshot state: ${snapshot.state}, bytesTransferred: ${snapshot.bytesTransferred}, totalBytes: ${snapshot.totalBytes}`);
      const progress = snapshot.totalBytes > 0 ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 : 0;
      const now = Date.now();
      const timeDiff = (now - lastUpdate) / 1000;
      const bytesDiff = snapshot.bytesTransferred - lastTransferred;
      const speed = timeDiff > 0 ? (bytesDiff / timeDiff / 1024).toFixed(2) : 0;
      
      console.log(`Upload progress: ${progress.toFixed(2)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes}) - Speed: ${speed} KB/s`);
      
      lastTransferred = snapshot.bytesTransferred;
      lastUpdate = now;
      onProgress(progress);
    }, 
    (error) => {
      clearTimeout(timeout);
      console.error("Upload task error:", error);
      if (error.code === 'storage/unauthorized') {
        reject(new Error("فشل الرفع: ليس لديك صلاحية للرفع إلى Storage. يرجى التأكد من ضبط قواعد الحماية (Rules) في Firebase Console لتسمح بالرفع."));
      } else if (error.code === 'storage/canceled') {
        reject(new Error("تم إلغاء الرفع بسبب انتهاء المهلة أو تدخل المستخدم."));
      } else {
        reject(error);
      }
    }, 
    async () => {
      clearTimeout(timeout);
      console.log("Upload completed successfully. Fetching download URL...");
      try {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("Download URL fetched:", downloadURL);
        resolve(downloadURL);
      } catch (err) {
        console.error("Get download URL error:", err);
        reject(err);
      }
    }
  );
};

export const deleteFile = async (path: string) => {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
};

// Validate Connection to Firestore
async function testConnection() {
  try {
    await firestoreGetDocFromServer(firestoreDoc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
    // Skip logging for other errors, as this is simply a connection test.
  }
}
testConnection();

export default app;
