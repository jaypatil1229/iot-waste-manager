// import { MongoClient } from "mongodb";
// import { NextResponse } from "next/server";
// import { getSession } from 'next-auth/react';

// const uri = process.env.MONGO_URI; 
// const client = new MongoClient(uri);

// export async function POST(request) {
//   const session = await getSession({ req });

//   if (!session) {
//     return res.status(401).json({ message: 'Not authenticated' });
//   }

//   try {
//     // Parse the request body
//     const { email, password } = await request.json();

//     // Validate input
//     if (!email || !password) {
//       return NextResponse.json({
//         success: false,
//         message: "Email and password are required",
//       });
//     }

//     // Connect to the database
//     const database = client.db("wastemanager");
//     const collectorsCollection = database.collection("collectors");

//     // Find user by email
//     const user = await collectorsCollection.findOne({ email });

//     if (!user) {
//       console.log('User not found')
//       return NextResponse.json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     const isPasswordValid = user.password === password;

//     if (!isPasswordValid) {
//       console.log('Password is not valid')
//       return NextResponse.json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Login successful",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return NextResponse.json({
//       success: false,
//       message: "An error occurred during login",
//       error: error.message,
//     });
//   } finally {
//     // Ensure the client is closed
//     await client.close();
//   }
// }

