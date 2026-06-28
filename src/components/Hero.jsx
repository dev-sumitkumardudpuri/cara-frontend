import React from "react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full h-[75vh] md:h-[90vh] flex flex-col items-start justify-center px-8 sm:px-16 md:px-24 bg-no-repeat dark:bg-zinc-950 transition-colors duration-300"
      style={{
        backgroundImage: "url('/img/hero4.png')",
        backgroundPosition: "top 25% right 0%",
        backgroundSize: "cover",
      }}
    >
      {/* Decorative Dark Mode Gradient Overlay */}
      <div className="absolute inset-0 bg-transparent dark:bg-linear-to-r dark:from-zinc-950/80 dark:via-zinc-950/40 dark:to-transparent transition-colors duration-300 z-0 pointer-events-none"></div>

      {/* Structural Content Frame */}
      <div className="max-w-xl space-y-1 md:space-y-2 z-10 relative">
        <h4 className="text-zinc-800 dark:text-zinc-300 font-bold text-base md:text-lg tracking-wide uppercase">
          Trade-in-offer
        </h4>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-950 dark:text-white leading-tight drop-shadow-sm">
          Super Value Deals
        </h2>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#088178] leading-tight">
          On All Products
        </h1>

        <p className="text-zinc-600 dark:text-zinc-200 text-sm sm:text-base md:text-lg font-medium pt-1">
          Save more with coupons & up to 70% off!
        </p>

        {/* Primary Call To Action Segment */}
        <div className="pt-4 md:pt-5">
          <Link
            to="/shop"
            className="inline-block text-[#088178] dark:text-[#0bd1c3] font-bold text-sm md:text-base bg-transparent border-0 cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1 active:scale-98 bg-no-repeat hover:brightness-110 dark:hover:drop-shadow-[0_0_15px_rgba(11,209,195,0.3)]"
            style={{
              backgroundImage: "url('/img/button.png')",
              padding: "14px 80px 14px 65px",
              backgroundSize: "100% 100%",
            }}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
