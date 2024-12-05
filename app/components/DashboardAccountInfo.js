"use client";
import Image from "next/image";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import { IoIosArrowForward } from "react-icons/io";
import { IoMdLogOut } from "react-icons/io";

const DashboardAccountInfo = () => {
  const { data: session, status } = useSession();

  return (
    <div>
      <div className="account-info flex justify-between items-center">
        <h1 className="text-lg sm:text-3xl font-semibold ml-6">Welcome, {session.user.name.split(' ')[0]}👋🏻</h1>
        <div className="profile-container flex gap-4 items-center">
          <div className="profile min-w-32 sm:min-w-36 p-1 flex items-center rounded-full border border-slate-400 gap-2">
            <Image
              src="/images/male-pfp.png"
              alt="Profile Pic"
              width={40}
              height={40}
              className="rounded-full w-8 sm:w-10 h-8 sm:h-10"
            />
            <div className="details w-fit flex flex-col">
              <h2 className="leading-none text-sm sm:text-base font-semibold">{session.user.name}</h2>
              <span className=" text-xs sm:text-sm">{session.user.isAdmin ? "Admin": "Collector"}</span>
            </div>
            {/* <div className="options-btn">
              <button className="">
                <IoIosArrowForward />
              </button>
            </div> */}
          </div>
          <div className="logout-btn-container hidden sm:flex">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-3 bg-red-500 text-white rounded-full flex gap-1 items-center font-semibold"
            >
              <IoMdLogOut size={"1.2rem"} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAccountInfo;
