"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { IoHomeOutline } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";
import { RiDeleteBin7Line } from "react-icons/ri";
import Footer from "./Footer";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useMediaQuery } from "react-responsive";

const Navbar = ({ handleNavbarDisplay }) => {
  const isSmallScreen = useMediaQuery({ maxWidth: 639 });
  const pathname = usePathname();
  const { data: session } = useSession();

  // Function to determine if a route is active
  const isActive = (route) => pathname === route;
  return (
    <nav className="w-full z-100 relative font-sans min-h-full bg-blue-600 rounded-3xl p-3 text-white flex flex-col gap-3">
      <div className="close-icon flex sm:hidden absolute right-3 top-3 bg-red-500 rounded-full items-center justify-center p-0.5">
        <button
          onClick={() => handleNavbarDisplay(false)}
          className="rounded-full text-white focus:outline-none"
        >
          <IoIosCloseCircleOutline size={"1.5rem"} />
        </button>
      </div>
      <h2 className="text-xl font-bold text-center">Waste Manager</h2>
      <div className="nav-links w-full flex flex-col gap-2 mt-2 flex-1">
        <Link
          onClick={() => handleNavbarDisplay(!isSmallScreen)}
          href="/"
          className={`w-full flex gap-2 items-center ${
            isActive("/") ? "bg-blue-400" : ""
          }  px-3 py-1 rounded-xl font-semibold`}
        >
          <IoHomeOutline />
          <span>Home</span>
        </Link>
        {session?.user.isAdmin && (
          <Link
            onClick={() => handleNavbarDisplay(!isSmallScreen)}
            href="/collectors"
            className={`w-full flex gap-2 items-center ${
              isActive("/collectors") ? "bg-blue-400" : ""
            }  px-3 py-1 rounded-xl font-semibold`}
          >
            <IoPeopleOutline />
            <span>Collectors</span>
          </Link>
        )}

        <Link
          onClick={() => handleNavbarDisplay(!isSmallScreen)}
          href="/dustbins"
          className={`w-full flex gap-2 items-center ${
            isActive("/dustbins") ? "bg-blue-400" : ""
          }  px-3 py-1 rounded-xl font-semibold`}
        >
          <RiDeleteBin7Line />
          <span>Dustbins</span>
        </Link>
      </div>
      <Footer />
    </nav>
  );
};

export default Navbar;
