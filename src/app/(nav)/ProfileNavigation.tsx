"use client";
import { useSession } from "next-auth/react"
import SignOutButton from "./SignOutButton";
import SIgnInButton from "./SIgnInButton";

export default function ProfileNavigation() {
    const { data: session, status } = useSession();

    console.log(session, status)

    if (status === 'authenticated') {
        return (
            <>Logged in, <SignOutButton /></>
        )
    } else {
        return <>Not logged in, <SIgnInButton /></>
    }
}




