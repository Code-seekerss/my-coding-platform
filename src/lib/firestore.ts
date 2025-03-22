import { setDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const addTestData = async (userId: string) => {
  try {
    const testDocRef = doc(db, 'test', userId);
    await setDoc(testDocRef, {
      name: 'Test User',
      score: 100,
      createdAt: serverTimestamp(),
      userId: userId
    });
    return true;
  } catch (error) {
    console.error('Error adding test data:', error);
    return false;
  }
};

export const getTestData = async (userId: string) => {
  try {
    const testDocRef = doc(db, 'test', userId);
    const testDoc = await getDoc(testDocRef);
    if (testDoc.exists()) {
      return testDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting test data:', error);
    return null;
  }
}; 