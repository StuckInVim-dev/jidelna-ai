import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { prisma } from '@/lib/prisma';
import { PrismaAdapter } from "@auth/prisma-adapter";



export const authOptions = {
    adapter: PrismaAdapter(prisma),
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID!,
			clientSecret: process.env.GITHUB_SECRET!,
		}),
	],
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
