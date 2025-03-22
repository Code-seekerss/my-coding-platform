'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import Navbar from '@/components/nav/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CodeEditor from '@/components/editor/CodeEditor';

export default function EditorPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/');
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <LoadingSpinner fullScreen size="lg" />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Code Editor</h1>
          <p className="text-gray-600">Write, analyze, and improve your code with AI assistance.</p>
        </div>
        <CodeEditor />
      </main>
    </div>
  );
} 