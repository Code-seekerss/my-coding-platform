import Image from "next/image";
import LoginButton from '@/components/auth/LoginButton';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to My Coding Platform</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Get started by signing in with your Google account
        </p>
        <LoginButton />
      </div>
    </main>
  );
}
