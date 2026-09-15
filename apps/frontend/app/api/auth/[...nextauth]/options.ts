import CredentialsProvider from "next-auth/providers/credentials";
import { ISODateString, type AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

export interface CustomSession {
  user?: CustomUser;
  expires: ISODateString;
}

export interface CustomUser {
  id: string;
  email?: string | null;
}

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/admin",
  },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (
          !credentials?.email ||
          !credentials?.password ||
          credentials.email !== adminEmail ||
          credentials.password !== adminPassword
        ) {
          return null;
        }

        return { id: "admin", email: adminEmail };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as CustomUser;
      }
      return token;
    },
    async session({ session, token }: { session: CustomSession; token: JWT }) {
      if (token.user) {
        session.user = token.user as CustomUser;
      }
      return session;
    },
  },
};
