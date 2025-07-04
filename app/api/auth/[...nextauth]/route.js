import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect"; // Import your DB connection function
import Collector from "@/models/collector";

// NextAuth Configuration
export const authOptions = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const { email, password } = credentials;
        // Connect to DB
        await dbConnect();
        const collector = await Collector.findOne({ email });
        console.log("collector found");

        if (!collector) {
          console.log("error: No collector found");
          throw new Error("No user found");
        }

        // Check if the password is correct (ensure hashed passwords are used in production)
        if (collector.password !== password) {
          console.log("error: Password is incorrect");
          throw new Error("Incorrect password");
        }

        console.log("Collector is admin:", collector.isAdmin);
        return {
          id: collector._id,
          email: collector.email,
          name: collector.name,
          isAdmin: collector.isAdmin,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login", // Custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for JWT
  callbacks: {
    // Customize the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Correctly set user ID to token
        token.isAdmin = user.isAdmin; // Add isAdmin to the JWT token
        // token.accessToken = user.accessToken;
      }
      return token;
    },

    // Customize the session object
    async session({ session, token }) {
      if (token) {
        // session.accessToken = token.accessToken;
        session.user.id = token.id; // Correctly assign user ID to session
        session.user.isAdmin = token.isAdmin; // Correctly assign isAdmin to session
      }
      return session;
    },
  },
});

export { authOptions as GET, authOptions as POST };
