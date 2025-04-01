import Link from "next/link";
import ProfileNavigation from "./ProfileNavigation";
import SignOutButton from "./SignOutButton";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>
        <header className="w-full bg-zinc-50 shadow-lg select-none">
            <nav className="flex flex-row justify-between items-center px-[20px] h-[65px]">
                <Link href="/">
                <p className="text-slate-900 font-medium text-2xl">AI Jídelna</p>
                </Link>
                <ProfileNavigation />

            </nav>
        </header>
        {children}
    </>
}