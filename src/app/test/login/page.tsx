"use client";

import { useSession } from "next-auth/react"

export default function AuthCheck() {
    const { data: session, status } = useSession();

    console.log(session, status)

    if (status === 'authenticated') {
        return <>LOGGED IN</>
    } else {
        return <>Not logged in</>
    }
}