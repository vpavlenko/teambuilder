import { User, Project } from "./types";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  CollectionReference,
  DocumentData,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCW1GUYsDhD26rPfi_5kxp7BuJaAVFcXwI",
  authDomain: "teambuilder-4a75c.firebaseapp.com",
  projectId: "teambuilder-4a75c",
  storageBucket: "teambuilder-4a75c.firebasestorage.app",
  messagingSenderId: "973119314353",
  appId: "1:973119314353:web:57799fc07c80e055654590",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection references
export const usersCollection = collection(db, "users").withConverter<User>({
  toFirestore: (user) => user,
  fromFirestore: (snapshot) => snapshot.data() as User,
});

export const projectsCollection = collection(
  db,
  "projects"
).withConverter<Project>({
  toFirestore: (project) => project,
  fromFirestore: (snapshot) => snapshot.data() as Project,
});

// Helper functions for Firestore operations
export const getFromFirestore = async <T extends DocumentData>(
  collectionRef: CollectionReference<T>
): Promise<Array<T & { id: string }>> => {
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const setToFirestore = async <T extends DocumentData & { id: string }>(
  collectionRef: CollectionReference<DocumentData>,
  data: T
): Promise<void> => {
  await setDoc(doc(collectionRef, data.id), data);
};

export const updateInFirestore = async <
  T extends DocumentData & { id: string }
>(
  collectionRef: CollectionReference<DocumentData>,
  data: T
): Promise<void> => {
  await updateDoc(doc(collectionRef, data.id), data);
};

export { db };
