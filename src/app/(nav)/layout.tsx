import ProfileNavigation from "./ProfileNavigation";
import SignOutButton from "./SignOutButton";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>
        <header className="w-full h-[20px] bg-blue-500">
            <nav>
                <ProfileNavigation />
            </nav>
        </header>
        {children}
    </>
}