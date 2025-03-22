'use client';

import { useState, useEffect } from 'react';
import { addTestData, getTestData } from '@/lib/firestore';
import { User } from 'firebase/auth';

interface TestDataCardProps {
  user: User;
}

interface TestData {
  name: string;
  score: number;
  createdAt: any;
  userId: string;
}

export default function TestDataCard({ user }: TestDataCardProps) {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTestData = async () => {
    const data = await getTestData(user.uid);
    setTestData(data as TestData | null);
  };

  const handleAddTestData = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await addTestData(user.uid);
      if (success) {
        await loadTestData();
      } else {
        setError('Failed to add test data');
      }
    } catch (err) {
      setError('An error occurred while adding test data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestData();
  }, [user.uid]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Firestore Test</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {testData ? (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <p className="text-gray-900">{testData.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Score</label>
            <p className="text-gray-900">{testData.score}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Created At</label>
            <p className="text-gray-900">
              {testData.createdAt?.toDate().toLocaleString() || 'N/A'}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 mb-4">No test data found.</p>
      )}

      <button
        onClick={handleAddTestData}
        disabled={loading}
        className={`mt-4 px-4 py-2 rounded-md text-sm font-medium text-white 
          ${loading 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
      >
        {loading ? 'Adding...' : 'Add Test Data'}
      </button>
    </div>
  );
} 