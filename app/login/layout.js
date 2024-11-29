import "../globals.css";
import { Poppins } from "next/font/google";

// Configure the font with weights and subsets
const poppins = Poppins({
  subsets: ["latin"], // Choose subsets you need
  weight: ["400", "500", "600", "700"], // Choose weights you need
  variable: "--font-poppins", // CSS variable for Tailwind or custom styles
});

export const metadata = {
  title: "Login Page",
};

export default function LoginLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased w-screen min-h-screen flex gap-2 h-screen overflow-x-hidden bg-slate-200 p-3`}
      >
        {children}
      </body>
    </html>
  );
}
