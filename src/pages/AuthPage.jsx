import React, { useState } from "react";
import Separator from "../components/Separator";
import { Link, useNavigate } from "react-router-dom";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { findEmail } from "../store/user-slice";

const AuthPage = () => {
  const [email, setEmail] = useState(sessionStorage.getItem("email") || "");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    sessionStorage.setItem("email", email);
    try {
      const result = await dispatch(findEmail({ email }));
      if (findEmail.fulfilled.match(result)) {
        navigate("/login");
      } else {
        navigate("/signup");
      }
    } catch (err) {
      if (err.status === 404) {
        navigate("/signup");
      } else {
        console.log(err.response.data.errors);
      }
    }
  };
  return (
    <div className="hero-bg relative">
      {/* Auth section */}
      <div className="flex flex-col items-center justify-center text-center py-44 text-white max-w-6xl mx-auto">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 lg:w-6/10 text-balance">
          Unlimited movies, TV shows and more
        </h1>
        <p className="text-xl font-semibold mb-8">
          Starts at{" "}
          <FaIndianRupeeSign
            className="inline"
            size={18}
            strokeWidth={3}
          />
          149. Cancel at any time.
        </p>
        <p className="mb-4">
          Ready to watch? Enter your email to create or restart your membership.
        </p>
        <form
          className="flex flex-col md:flex-row gap-2 w-1/2"
          onSubmit={handleFormSubmit}
        >
          <input
            type="email"
            placeholder="Email address"
            className="p-2 rounded flex-1 bg-black/80 border border-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="bg-red-600 text-xl lg:text-2xl px-2 lg:px-6 py-1 md:py-2 rounded flex justify-center items-center">
            Get Started
            <FaChevronRight className="size-8 md:size-10" />
          </button>
        </form>
      </div>
      <Separator />
      {/* video on tv section */}
      <div className="pb-36 -mb-10 bg-black text-white">
        <div className="flex flex-col md:flex-row px-4 md:px-2 max-w-6xl mx-auto items-center justify-center">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Enjoy on your TV
            </h2>
            <p className="text-lg md:text-xl">
              Watch on Smart TVs, PlayStation, Xbox, Chromecast, Apple TV,
              Blu-ray players, and more.
            </p>
          </div>
          <div className="flex-1 relative">
            <img
              src="/tv.png"
              alt="Tv image"
              className="mt-4 relative z-20"
            />
            <video
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1/2 z-10"
              playsInline
              autoPlay={true}
              muted
              loop
            >
              <source
                src="/hero-vid.m4v"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      </div>
      <Separator />
      {/* image on mobile section */}
      <div className="pb-36 -mb-10 bg-black text-white">
        <div className="flex flex-col-reverse md:flex-row px-4 md:px-2 max-w-6xl mx-auto items-center justify-center">
          <div className="flex-1 ">
            <div className="relative">
              <img
                src="/stranger-things-lg.png"
                alt="Stranger Thing image"
                className="mt-4"
              />
              <div className="flex items-center gap-2 absolute bottom-5 left-1/2 -translate-x-1/2 bg-black w-3/4 lg:w-1/2 h-24 border border-slate-500 rounded-md px-2">
                <img
                  src="/stranger-things-sm.png"
                  alt="image"
                  className="h-full"
                />
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col gap-0">
                    <span className="text-md lg:text-lg font-bold">
                      Stranger Things
                    </span>
                    <span className="text-sm text-blue-500">
                      Downloading...
                    </span>
                  </div>
                  <img
                    src="/download-icon.gif"
                    alt=""
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-balance">
              Download your show to watch offline
            </h2>
            <p className="text-lg md:text-xl">
              Save your favorites easily and always have something to watch.
            </p>
          </div>
        </div>
      </div>
      <Separator />
      {/* All screen section */}
      <div className="pb-36 -mb-10 bg-black text-white">
        <div className="flex flex-col md:flex-row px-4 md:px-2 max-w-6xl mx-auto items-center justify-center">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Watch everywhere
            </h2>
            <p className="text-lg md:text-xl">
              Stream unlimited movies and TV shows on your phone, tablet, laptop
              and TV.
            </p>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <img
              src="/device-pile.png"
              alt="Device pile image"
              className="mt-4 relative z-20"
            />
            <video
              className="absolute top-2 left-1/2 -translate-x-1/2 h-4/6 max-w-[63%] z-10"
              playsInline
              autoPlay={true}
              muted
              loop
            >
              <source
                src="/video-devices.m4v"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      </div>
      <Separator />
      {/* Profile creation section */}
      <div className="pb-36 -mb-10 bg-black text-white">
        <div className="flex flex-col-reverse md:flex-row px-4 md:px-2 max-w-6xl mx-auto items-center justify-center">
          <div className="flex-1 relative">
            <img
              src="/kids.png"
              alt="Kids image"
              className="mt-4"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-balance">
              Create profiles for kids
            </h2>
            <p className="text-lg md:text-xl">
              Send kids on adventure with their favorite characters in a space
              made just for them-free with your membership.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
