import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StoreConfig } from '../types';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

const STORE_DOC_REF = doc(db, 'store', 'mainConfig');

export async function loadConfigFromFirebase(): Promise<StoreConfig | null> {
  try {
    const snap = await getDoc(STORE_DOC_REF);
    if (snap.exists()) {
      return snap.data() as StoreConfig;
    }
  } catch (err) {
    console.warn('Could not load config from Firebase Firestore:', err);
  }
  return null;
}

export async function saveConfigToFirebase(config: StoreConfig): Promise<boolean> {
  try {
    await setDoc(STORE_DOC_REF, JSON.parse(JSON.stringify(config)));
    return true;
  } catch (err) {
    console.error('Failed to save config to Firebase Firestore:', err);
    return false;
  }
}

export function subscribeConfig(onChange: (config: StoreConfig) => void) {
  try {
    return onSnapshot(STORE_DOC_REF, (snap) => {
      if (snap.exists()) {
        onChange(snap.data() as StoreConfig);
      }
    }, (err) => {
      console.warn('Firestore snapshot error:', err);
    });
  } catch (err) {
    console.warn('Could not subscribe to Firebase Firestore:', err);
    return () => {};
  }
}
