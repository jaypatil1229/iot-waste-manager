import "../globals.css";
import { Poppins } from "next/font/google";
import Navbar from "../components/Navbar";
import SessionProviderWrapper from "../components/SessionProviderWrapper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ServiceWorker from "../components/ServiceWorker";

// Configure the font with weights and subsets
const poppins = Poppins({
  subsets: ["latin"], // Choose subsets you need
  weight: ["400", "500", "600", "700"], // Choose weights you need
  variable: "--font-poppins", // CSS variable for Tailwind or custom styles
});

export const metadata = {
  title: "IoT West Manager",
  description: "Automate Cleaning Routes",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased w-screen min-h-screen flex gap-2 h-screen overflow-x-hidden bg-slate-200 p-3`}
      >
        <SessionProviderWrapper>
          <div className="nav-container w-1/6">
            <Navbar />
          </div>
          <ServiceWorker /> 
          {children}
          <ToastContainer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
