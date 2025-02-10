import NextAuth from "next-auth";
import {prisma} from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
// import {compare} from "./lib/encrypt";
import type {NextAuthConfig} from "next-auth";
import {cookies} from "next/headers";
import {compareSync} from "bcrypt-ts-edge";
import {authConfig} from "./auth.config";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {type: "email"},
        password: {type: "password"},
      },
      async authorize(credentials) {
        if (credentials == null) return null;
        // Find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // Check if user exists and if the password matches
        if (user && user.password) {
          const isMatch = await compareSync(
            credentials.password as string,
            user.password
          );

          // If password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        // If user does not exist or password does not match return null
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({session, user, trigger, token}: any) {
      session.user.id = token.sub; // set the user id from the token
      session.user.role = token.role; // set the user role from the token
      session.user.name = token.name; // set the user name from the token

      //if there is an update, set  the user name
      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
    },

    async jwt({token, user, trigger, session}: any) {
      //assing user fields to token
      if (user) {
        token.id = user.id;
        token.role = user.role;

        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];

          //upodate the user name
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              name: token.name,
            },
          });
        }
      }

      return token;
    },
  },
};

export const {handlers, auth, signIn, signOut} = NextAuth(config);
