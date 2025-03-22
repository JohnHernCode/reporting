import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials;
        await connectToDatabase();
        const user = await User.findOne({ username });

        if (!user) {
          throw new Error("No user found with this username.");
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Password is incorrect.");
        }

        try {
          await User.updateOne({ _id: user._id }, { $set: { loggedIn: true } });
        } catch (error) {
          throw new Error("Failed to update login status.");
        }

        return {
          id: user._id.toString(), // ✅ Ensure ID is returned
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // ✅ Attach user ID to token
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id; // ✅ Attach user ID to session
      }
      return session;
    },
  },
  pages: {
    signIn: "/authentication/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
