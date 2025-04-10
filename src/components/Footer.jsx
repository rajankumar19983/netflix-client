import React from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import ContentWrapper from "./ContentWrapper";

const listStyle =
  "transition-all ease-in duration-300 cursor-pointer text-[12px] md:text-[16px] hover:text-red-500";

const iconStyle =
  "w-[50px] h-[50px] rounded-full bg-dark_1 flex items-center justify-center cursor-pointer transition-all ease-in duration-300 hover:text-red-500 hover:shadow-[0_0_0.625em] hover:shadow-red-500";

const Footer = () => {
  return (
    <footer className="bg-dark_3 py-[50px] text-white relative">
      <ContentWrapper className="flex flex-col items-center">
        <ul className="list-none flex items-center justify-center gap-[15px] mb-5 md:mb-[30px] md:gap-[30px]">
          <li className={listStyle}>Terms & Conditions</li>
          <li className={listStyle}>Privacy-Policy</li>
          <li className={listStyle}>About</li>
          <li className={listStyle}>Blog</li>
          <li className={listStyle}>FAQ</li>
        </ul>
        <div className="text-[12px] leading-tight opacity-50 text-center max-w-[800px] mb-5 md:text-[14px] md:mb-[30px]">
          NetFlix, your ultimate destination for all things cinematic! Immerse
          yourself in the world of movies and TV series like never before.
          Discover the latest trailers, delve into comprehensive details, and
          stay up-to-date with the entertainment industry's hottest releases.
        </div>
        <div className="flex items-center justify-center gap-[10px]">
          <span className={iconStyle}>
            <FaFacebook />
          </span>
          <span className={iconStyle}>
            <FaInstagram />
          </span>
          <span className={iconStyle}>
            <FaTwitter />
          </span>
          <span className={iconStyle}>
            <FaLinkedin />
          </span>
        </div>
      </ContentWrapper>
    </footer>
  );
};

export default Footer;
