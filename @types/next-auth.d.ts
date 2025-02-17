import {DefaultSession} from "next-auth";

// This is a custom type definition file for NextAuth.js to add a role field to the user object in the session.
declare module "next-auth" {
  export interface Session {
    user: {
      role: string;
    } & DefaultSession["user"];
  }
}
