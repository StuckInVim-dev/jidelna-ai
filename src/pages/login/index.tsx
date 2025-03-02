import Head from 'next/head';
import AuthForm from '@/components/authForm';
import Link from 'next/link';

export default function Login() {
  return (
    <div>
      <Head>
        <title>Log In</title>
      </Head>
      
      <main className="container mx-auto px-4">
        <AuthForm type="login" />
        
        <p className="text-center mt-4">
          Don't have an account?{' '}
          <Link href="/register">
            <span className="text-blue-500 hover:underline">Register</span>
          </Link>
        </p>
      </main>
    </div>
  );
}