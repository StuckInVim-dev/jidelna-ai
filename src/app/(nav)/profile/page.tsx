import SignOutButton from "../SignOutButton";
import { redirect } from 'next/navigation'
import { signInUrl } from "@/lib/urls";
import { auth } from "@/lib/auth/auth";


export default async function Profile() {
    const session = await auth()
    if(!session){
        redirect(signInUrl)
    }


    return (
        <div>
            <h1 className="font-medium text-slate-900 text-3xl m-[20px]">{session.user?.name}'s profile</h1>
            <SignOutButton />
        </div>
    )
}