import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    // Redirect unauthenticated users to sign-in
    redirect("/lik");
  }
  const currentUserEmail = session?.user?.email!;
  const user = await prisma.user.findUnique({
    where: {
        email: currentUserEmail,
    }
  });

  return (
    <ProfileForm/>
  );
}
