import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const CircleRating = ({ rating, className, textColor }) => {
  return (
    <div className={`bg-dark_1 rounded-[50%] p-[2px] ${className ?? ""}`}>
      <CircularProgressbar
        value={rating}
        maxValue={10}
        text={rating}
        styles={buildStyles({
          pathColor: rating < 5 ? "red" : rating < 7 ? "orange" : "green",
          textSize: 34,
          textColor: `${textColor}`,
          trailColor: "transparent",
        })}
      />
    </div>
  );
};

export default CircleRating;
