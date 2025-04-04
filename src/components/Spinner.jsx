import React from "react";
import { twMerge } from "tailwind-merge";

const Spinner = ({ initial }) => {
  return (
    <div
      className={twMerge(
        `w-full h-[150px] relative flex items-center justify-center ${
          initial ? "h-[500px]" : ""
        }`
      )}
    >
      <svg
        className="w-12 h-12 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 50 50"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
          className="opacity-25"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
          className="stroke-sky-300"
          style={{ animation: "dash 1.5s ease-in-out infinite" }}
        />
      </svg>
    </div>
  );
};

export default Spinner;
