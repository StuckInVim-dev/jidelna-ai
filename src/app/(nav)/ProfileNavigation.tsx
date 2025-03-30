"use client";
import Image from 'next/image';
import { useSession } from "next-auth/react"
import SignOutButton from "./SignOutButton";
import Link from 'next/link';
import { signInUrl } from '@/lib/urls';

export default function ProfileNavigation() {
    const { data: session, status } = useSession();
    
    console.log(session, status)

    if (status === 'authenticated') {
        return (
            <Link href={"/profile"} className='flex flex-row items-center hover:underline'>
                <span className='h-fit text-slate-700'>{session.user?.name}</span>
                <Image src={session.user?.image ?? "/images/default_pfp.png"}
                    alt="Profile picture"
                    height={0}
                    width={0}
                    className='size-[50px] rounded-full mx-[10px]'
                    unoptimized

                />

            </Link>
        )
    }

    if (status === 'loading') {
        return (
            <></>
        )
    }

    return (
        <Link href={signInUrl} className='text-slate-700 hover:underline'>Sign In</Link>
    )

}




