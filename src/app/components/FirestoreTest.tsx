'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, FirestoreError } from 'firebase/firestore';

export default function FirestoreTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testFirestore = async () => {
    setIsLoading(true);
    try {
      // Create a test document
      const testDocRef = doc(db, 'test', 'testDoc');
      await setDoc(testDocRef, {
        name: 'Test User',
        age: 25,
        timestamp: new Date().toISOString()
      });
      
      // Verify we can read it back
      const docSnap = await getDoc(testDocRef);
      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data());
        setTestResult('✅ Firestore test successful! Document written and read.');
      } else {
        setTestResult('❌ Document written but could not be read back.');
      }
    } catch (error: unknown) {
      console.error('Error testing Firestore:', error);
      const errorMessage = error instanceof FirestoreError 
        ? error.message 
        : 'An unknown error occurred';
      setTestResult(`❌ Firestore test failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Firestore Test</h2>
      <button
        onClick={testFirestore}
        disabled={isLoading}
        className={`px-4 py-2 rounded-md text-white ${
          isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isLoading ? 'Testing...' : 'Test Firestore'}
      </button>
      {testResult && (
        <div className={`mt-4 p-3 rounded ${
          testResult.includes('✅') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {testResult}
        </div>
      )}
    </div>
  );
} 