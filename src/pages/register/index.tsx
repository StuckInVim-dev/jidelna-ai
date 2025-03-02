import Head from 'next/head';
import AuthForm from '@/components/authForm';
import Link from 'next/link';

export default function Register() {
  return (
    <div>
      <Head>
        <title>Create Account</title>
      </Head>
      
      <main className="container mx-auto px-4">
        <AuthForm type="register" />
        
        <p className="text-center mt-4">
          Already have an account?{' '}
          <Link href="/login">
            <span className="text-blue-500 hover:underline">Log In</span>
          </Link>
        </p>
      </main>
    </div>
  );
}