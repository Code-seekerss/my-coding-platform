import Image from "next/image";
import LoginButton from './components/LoginButton';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to My Coding Platform
        </h1>
        <p className="text-xl text-gray-600">
          Sign in to start your coding journey
        </p>
        <LoginButton />
      </div>
    </main>
  );
}
