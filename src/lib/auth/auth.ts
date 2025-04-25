// lib/auth/auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { prisma } from '@/lib/prisma';
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from 'next-auth/adapters';

// Extend the default session type
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      profile(profile: any) {  // Temporarily typed as 'any' - we can refine this
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, user }: { session: any, user: any }) {
      session.user.id = user.id;
      return session;
    }
  },
  events: {
    async createUser({ user }: { user: any }) {
      // Create user preferences on signup
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
        }
      })
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };