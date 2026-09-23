"use client";

import React, { useState } from "react";

export function HeroDoodle() {
  const [cloudClicked, setCloudClicked] = useState(false);
  const [planeClicked, setPlaneClicked] = useState(false);

  const handleCloudClick = () => {
    setCloudClicked(true);
    setTimeout(() => setCloudClicked(false), 600);
  };

  const handlePlaneClick = () => {
    setPlaneClicked(true);
    setTimeout(() => setPlaneClicked(false), 800);
  };

  return (
    <div className="relative w-56 h-18 mx-auto flex items-center justify-center select-none">
      <svg
        viewBox="0 0 180 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Smiling Cloud on Left (Interactive on hover/click) */}
        <g
          className={`anim-cloud interactive-cloud ${cloudClicked ? "animate-button-pop" : ""}`}
          onClick={handleCloudClick}
          role="button"
          tabIndex={0}
          aria-label="Happy cloud, click to interact"
          style={{ pointerEvents: "auto" }}
        >
          {/* Cloud Body */}
          <path
            d="M22 40C16 40 11 35.5 11 29.5C11 24 15.5 19.5 21 19C22.5 12 28 7 36 7C43.5 7 49 11.5 51 17C52.5 16.5 54.5 16 56.5 16C63.5 16 69 21.5 69 28.5C69 29 69 29.5 68.9 30C72 31.5 74 34.5 74 38C74 43 69.5 47 64.5 47H22C16 47 11 42.5 11 37"
            fill="#FFFFFF"
            stroke="#2B3A2C"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Cloud Eyes (Crisp dark color for maximum visibility on white cloud) */}
          <circle cx="38" cy="27" r="1.6" fill="#1C2B1E" />
          <circle cx="50" cy="27" r="1.6" fill="#1C2B1E" />
          {/* Cloud Smile */}
          <path
            d="M42 31.5C43.2 33.2 45.8 33.2 47 31.5"
            stroke="#1C2B1E"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Rosy Cheeks */}
          <ellipse cx="34" cy="30.5" rx="1.8" ry="1.1" fill="#F48B8B" opacity="0.85" />
          <ellipse cx="54" cy="30.5" rx="1.8" ry="1.1" fill="#F48B8B" opacity="0.85" />
        </g>

        {/* Top Center Sparkle Star */}
        <g className="anim-star-1">
          <path
            d="M92 11V17M89 14H95"
            stroke="var(--accent-yellow)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>

        {/* Bottom Sparkle Star */}
        <g className="anim-star-2">
          <path
            d="M132 42V48M129 45H135"
            stroke="var(--accent-yellow)"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </g>

        {/* Dashed Looping Flight Trail */}
        <path
          d="M72 30C90 25 101 37 111 40C122 43 133 34 142 24"
          stroke="#4A5C4B"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />

        {/* Origami Paper Plane (Interactive on hover/click) */}
        <g
          className={`anim-plane interactive-plane ${planeClicked ? "animate-button-pop" : ""}`}
          onClick={handlePlaneClick}
          role="button"
          tabIndex={0}
          aria-label="Paper plane, click to interact"
          style={{ pointerEvents: "auto" }}
        >
          {/* Main Top Wing */}
          <path
            d="M174 6L143 23L156 18L174 6Z"
            fill="#96C594"
            stroke="#1C331A"
            strokeWidth="1.3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Right Main Wing / Top Surface */}
          <path
            d="M174 6L156 18L163 29L174 6Z"
            fill="#7CAE7A"
            stroke="#1C331A"
            strokeWidth="1.3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Center Crease / Keel underfold */}
          <path
            d="M156 18L151 25L159 21Z"
            fill="#5A8C58"
            stroke="#1C331A"
            strokeWidth="1.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Center Ridge Line */}
          <path
            d="M174 6L156 18"
            stroke="#122410"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

export function PlantDoodle() {
  const [clicked, setClicked] = useState(false);

  return (
    <div
      className={`flex items-end select-none cursor-pointer transition-transform hover:scale-110 ${clicked ? "animate-button-pop" : ""}`}
      onClick={() => {
        setClicked(true);
        setTimeout(() => setClicked(false), 500);
      }}
      title="🌱 Click me!"
    >
      <svg
        viewBox="0 0 90 95"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-14 h-16 sm:w-16 sm:h-18"
      >
        {/* Floor baseline */}
        <path d="M0 90H88" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Plant Leaves */}
        <g className="anim-plant">
          {/* Center Leaf */}
          <path
            d="M44 58C44 38 38 24 44 8C50 24 44 38 44 58Z"
            fill="#88C485"
            stroke="#2B4629"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M44 14V55" stroke="#4A7548" strokeWidth="1.1" strokeLinecap="round" />

          {/* Left Leaf */}
          <path
            d="M42 54C32 40 18 38 14 29C25 29 36 40 42 54Z"
            fill="#72AF70"
            stroke="#2B4629"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Right Leaf */}
          <path
            d="M46 54C56 40 70 38 74 29C63 29 52 40 46 54Z"
            fill="#72AF70"
            stroke="#2B4629"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </g>

        {/* Pot */}
        <path
          d="M28 58H60C62 58 63.5 59.5 63 61.5L59 84C58.5 86.5 56.5 88 54 88H34C31.5 88 29.5 86.5 29 84L25 61.5C24.5 59.5 26 58 28 58Z"
          fill="#FFFFFF"
          stroke="#2B4629"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M24 58H64"
          stroke="#2B4629"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Pot Eyes (Fixed dark contrast on white pot) */}
        <circle cx="39" cy="73" r="1.5" fill="#1C2B1E" />
        <circle cx="49" cy="73" r="1.5" fill="#1C2B1E" />
        {/* Pot Smile */}
        <path
          d="M42 77.5C43 78.8 45 78.8 46 77.5"
          stroke="#1C2B1E"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        {/* Pot Cheeks */}
        <ellipse cx="35" cy="75" rx="1.5" ry="0.9" fill="#F48B8B" opacity="0.8" />
        <ellipse cx="53" cy="75" rx="1.5" ry="0.9" fill="#F48B8B" opacity="0.8" />
      </svg>
    </div>
  );
}

export function TeaMugDoodle() {
  const [clicked, setClicked] = useState(false);

  return (
    <div
      className={`flex items-end select-none cursor-pointer transition-transform hover:scale-110 ${clicked ? "animate-button-pop" : ""}`}
      onClick={() => {
        setClicked(true);
        setTimeout(() => setClicked(false), 500);
      }}
      title="🍵 Click me!"
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 sm:w-14 sm:h-14"
      >
        {/* Floor baseline */}
        <path d="M5 75H78" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Animated Rising Steam */}
        <g>
          <path
            d="M34 28C32 22 36 18 34 13"
            stroke="#4ADE80"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="anim-steam-1"
          />
          <path
            d="M43 26C41 20 45 16 43 11"
            stroke="#4ADE80"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="anim-steam-2"
          />
        </g>

        {/* Mug Handle */}
        <path
          d="M55 42C64 42 66 58 53 60"
          stroke="#1C331A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Mug Body */}
        <path
          d="M21 35H55C56.5 35 57.5 36.5 57 38L54.5 67C54 70 51.5 72 48.5 72H27.5C24.5 72 22 70 21.5 67L19 38C18.5 36.5 19.5 35 21 35Z"
          fill="#4A7548"
          stroke="#1C331A"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Tea Surface */}
        <ellipse cx="38" cy="35" rx="17" ry="3" fill="#3D633B" stroke="#1C331A" strokeWidth="1.3" />

        {/* Mug Face (White face on dark matcha green mug) */}
        <circle cx="33" cy="54" r="1.4" fill="#FFFFFF" />
        <circle cx="43" cy="54" r="1.4" fill="#FFFFFF" />
        <path
          d="M36 58C37 59.2 39 59.2 40 58"
          stroke="#FFFFFF"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        {/* Blush */}
        <ellipse cx="29.5" cy="56" rx="1.5" ry="0.9" fill="#F48B8B" opacity="0.8" />
        <ellipse cx="46.5" cy="56" rx="1.5" ry="0.9" fill="#F48B8B" opacity="0.8" />
      </svg>
    </div>
  );
}

export function RayBursts() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[var(--accent-green)] flex-shrink-0 select-none pointer-events-none"
    >
      <path d="M4 4L8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2 10H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 16L8 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function RayBurstsRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[var(--accent-green)] flex-shrink-0 select-none pointer-events-none"
    >
      <path d="M16 4L12 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18 10H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 16L12 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
