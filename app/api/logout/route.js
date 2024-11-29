// import { serialize } from "cookie";

// export async function POST() {
//   const cookie = serialize("session-token", "", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     path: "/",
//     expires: new Date(0), // Expire immediately
//   });

//   return new Response(JSON.stringify({ message: "Logout successful." }), {
//     status: 200,
//     headers: { "Set-Cookie": cookie },
//   });
// }
