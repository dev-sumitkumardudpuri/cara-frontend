import React from "react";

function PromoBanners() {
  return (
    <section className="w-full px-4 sm:px-12 md:px-20 py-12 bg-white dark:bg-zinc-950 transition-colors duration-300 space-y-6">
      {/* Primary Hero Banner Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Promotion Deck 01 */}
        <div
          className="group relative flex flex-col justify-center items-start h-[45vh] lg:h-[50vh] p-6 sm:p-10 rounded-2xl bg-no-repeat bg-cover bg-center overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-100 dark:border-zinc-800"
          style={{ backgroundImage: "url('/img/banner/b17.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-brightness-100 dark:backdrop-brightness-110 transition-all duration-300 z-0"></div>

          <div className="z-10 space-y-1 sm:space-y-2 text-left max-w-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
            <h4 className="text-zinc-200 text-sm sm:text-base font-light tracking-wide">
              Crazy Deals
            </h4>
            <h2 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
              Buy 1 Get 1 Free
            </h2>
            <p className="text-zinc-100 text-xs sm:text-sm font-medium pb-4">
              The best classic dress is on sale at cara
            </p>
            <button className="px-5 py-2 text-xs sm:text-sm font-bold text-zinc-900 bg-white border border-white rounded-md group-hover:bg-[#088178] group-hover:border-[#088178] group-hover:text-white dark:group-hover:bg-[#0bd1c3] dark:group-hover:border-[#0bd1c3] dark:group-hover:text-zinc-950 transition-all duration-300 transform active:scale-95 cursor-pointer">
              Learn More
            </button>
          </div>
        </div>

        {/* Promotion Deck 02 */}
        <div
          className="group relative flex flex-col justify-center items-start h-[45vh] lg:h-[50vh] p-6 sm:p-10 rounded-2xl bg-no-repeat bg-cover bg-center overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-100 dark:border-zinc-800"
          style={{ backgroundImage: "url('/img/banner/b10.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-brightness-100 dark:backdrop-brightness-110 transition-all duration-300 z-0"></div>

          <div className="z-10 space-y-1 sm:space-y-2 text-left max-w-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
            <h4 className="text-zinc-200 text-sm sm:text-base font-light tracking-wide">
              Spring/Summer
            </h4>
            <h2 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
              Upcoming Season
            </h2>
            <p className="text-zinc-100 text-xs sm:text-sm font-medium pb-4">
              The best classic dress is on sale at cara
            </p>
            <button className="px-5 py-2 text-xs sm:text-sm font-bold text-zinc-900 bg-white border border-white rounded-md group-hover:bg-[#088178] group-hover:border-[#088178] group-hover:text-white dark:group-hover:bg-[#0bd1c3] dark:group-hover:border-[#0bd1c3] dark:group-hover:text-zinc-950 transition-all duration-300 transform active:scale-95 cursor-pointer">
              Collection
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Modular Grid Segment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Micro Banner Array 01 */}
        <div
          className="relative flex flex-col justify-center items-start h-[25vh] sm:h-[30vh] p-6 rounded-2xl bg-no-repeat bg-cover bg-center overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-zinc-100 dark:border-zinc-800 cursor-pointer"
          style={{ backgroundImage: "url('/img/banner/b7.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-brightness-100 dark:backdrop-brightness-110 transition-all duration-300 z-0"></div>
          <div className="z-10 text-left drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <h2 className="text-white font-black text-lg sm:text-xl tracking-wide uppercase">
              SEASONAL SALE
            </h2>
            <h3 className="text-[#ef3636] dark:text-red-400 font-extrabold text-xs sm:text-sm mt-1">
              Winter Collection ~50% OFF
            </h3>
          </div>
        </div>

        {/* Micro Banner Array 02 */}
        <div
          className="relative flex flex-col justify-center items-start h-[25vh] sm:h-[30vh] p-6 rounded-2xl bg-no-repeat bg-cover bg-center overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-zinc-100 dark:border-zinc-800 cursor-pointer"
          style={{ backgroundImage: "url('/img/banner/b4.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-brightness-100 dark:backdrop-brightness-110 transition-all duration-300 z-0"></div>
          <div className="z-10 text-left drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <h2 className="text-white font-black text-lg sm:text-xl tracking-wide uppercase">
              NEW FOOTWEAR
            </h2>
            <h3 className="text-[#ef3636] dark:text-red-400 font-extrabold text-xs sm:text-sm mt-1">
              Spring / Summer 2026
            </h3>
          </div>
        </div>

        {/* Micro Banner Array 03 */}
        <div
          className="relative flex flex-col justify-center items-start h-[25vh] sm:h-[30vh] p-6 rounded-2xl bg-no-repeat bg-cover bg-center overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-zinc-100 dark:border-zinc-800 cursor-pointer sm:col-span-2 lg:col-span-1"
          style={{ backgroundImage: "url('/img/banner/b18.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-brightness-100 dark:backdrop-brightness-110 transition-all duration-300 z-0"></div>
          <div className="z-10 text-left drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <h2 className="text-white font-black text-lg sm:text-xl tracking-wide uppercase">
              T-SHIRTS
            </h2>
            <h3 className="text-[#ef3636] dark:text-red-400 font-extrabold text-xs sm:text-sm mt-1">
              New Trendy Prints
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PromoBanners;
