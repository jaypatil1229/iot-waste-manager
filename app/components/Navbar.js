"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { IoHomeOutline } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";
import { RiDeleteBin7Line } from "react-icons/ri";
import Footer from "./Footer";


const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Function to determine if a route is active
  const isActive = (route) => pathname === route;
  return (
    <nav className="w-full font-sans min-h-full bg-blue-600 rounded-3xl p-3 text-white flex flex-col gap-3">
      <h2 className="text-xl font-bold text-center">Waste Manager</h2>
      <div className="nav-links w-full flex flex-col gap-2 mt-2 flex-1">
        <Link
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
