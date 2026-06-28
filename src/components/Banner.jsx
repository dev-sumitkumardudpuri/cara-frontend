import React from "react";
import { Link } from "react-router-dom";

function Banner() {
  return (
    <section
      id="banner"
      className="relative w-full h-[30vh] md:h-[35vh] flex flex-col items-center justify-center text-center px-4 sm:px-8 bg-no-repeat transition-all duration-300 shadow-md dark:shadow-xl dark:border-y dark:border-zinc-800"
      style={{
        backgroundImage: "url('/img/banner/b2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Visual Optimization Overlay Layer */}
      <div className="absolute inset-0 bg-transparent dark:bg-black/40 backdrop-brightness-110 dark:backdrop-saturate-125 transition-all duration-300 z-0"></div>

      {/* Content Container Frame */}
      <div className="z-10 flex flex-col items-center max-w-3xl space-y-2 md:space-y-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
        {/* Sub-tagline Definition */}
        <h4 className="text-xs sm:text-sm font-extrabold text-zinc-100 tracking-widest uppercase">
          Repair Services
        </h4>

        {/* Primary Graphic Heading */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-snug tracking-tight px-2">
          Up to{" "}
          <span className="text-[#ef3636] font-black drop-shadow-none">
            70% Off
          </span>{" "}
          – All T-Shirts & Accessories
        </h2>

        {/* Navigation Action Root */}
        <div className="pt-2 md:pt-3">
          <Link
            to="/shop"
            className="inline-block px-6 py-2.5 text-xs sm:text-sm font-bold tracking-wide uppercase bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md shadow-md border border-transparent hover:bg-[#088178] hover:text-white dark:hover:bg-[#0bd1c3] dark:hover:text-zinc-950 transition-all duration-300 transform active:scale-95 cursor-pointer drop-shadow-none"
          >
            Explore More
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Banner;
