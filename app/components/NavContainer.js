"use client";
import React, { useState } from "react";
import Navbar from "./Navbar";
// import { CgMenuGridO } from "react-icons/cg";
import { IoMenu } from "react-icons/io5";
import { useMediaQuery } from "react-responsive";

const NavContainer = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 639 }); // Tailwind `sm`: max-width 63
  const [isNavbarVisible, setIsNavbarVisible] = useState(!isSmallScreen); // Navbar is visible by default

  const handleNavbarDisplay = (visible) => {
    setIsNavbarVisible(visible);
  };

  return (
    <div className="nav-container mr-2 absolute z-[100] sm:static top-0 left-0 w-1/6 h-full">
      <div className="nav-open-btn-container absolute top-8 left-5 flex sm:hidden">
        <button
          onClick={() => handleNavbarDisplay(true)}
          className="mobile-navbar-toggle"
          aria-label="Toggle Navbar"
        >
          <IoMenu size={"1.5rem"}/>
        </button>
      </div>

      {/* Conditionally Render Navbar */}
      {isNavbarVisible && (
        <div className="nav-wrapper w-screen sm:w-full h-full">
          <Navbar handleNavbarDisplay={handleNavbarDisplay} />
        </div>
      )}
    </div>
  );
};

export default NavContainer;
