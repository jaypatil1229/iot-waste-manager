import React from "react";
import { FaGithub, FaInstagram, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="bg-blue-400 p-3 rounded-xl w-full flex flex-col gap-2">
      <div className="footer-text flex flex-col">
        <p className="font-semibold leading-5 text-center">IoT Waste Manager</p>
        <p className="text-sm text-center leading-none tracking-tight">
          Smarter Bins, Cleaner World.
        </p>
      </div>
      <div className="links flex gap-2 items-center justify-center">
        <a
          href="https://github.com/jaypatil1229"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub size={"1.4em"} />
        </a>
        <a
          href="https://www.instagram.com/jay_patil_1229/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram size={"1.4em"} />
        </a>
        <a
          href="https://www.facebook.com/profile.php?id=100018404542336"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook size={"1.4em"} />
        </a>
      </div>
    </div>
  );
};

export default Footer;
