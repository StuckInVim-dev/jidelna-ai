"use client";
import { signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';


export default function SignOutButton() {
    const router = useRouter();
    return <button onClick={() => { signOut(); router.push("/") }}>Sign Out</button>;
}