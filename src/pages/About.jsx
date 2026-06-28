import React from "react";
import Features from "../components/Features";

const About = () => {
  return (
    <div className="w-full bg-white dark:bg-slate-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Editorial Page Header */}
      <section
        className="w-full h-[40vh] flex flex-col justify-center text-center p-3.5 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url('img/about/banner.png')` }}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        <h2 className="text-white text-4xl md:text-5xl font-bold mb-2 z-10">
          #KnowUs
        </h2>
        <p className="text-white text-base md:text-lg max-w-xl mx-auto opacity-90 z-10">
          Get to know our story, our values, and what drives our passion for
          excellence.
        </p>
      </section>

      {/* Corporate Narrative Architecture */}
      <section className="px-6 py-16 md:px-20 flex flex-col md:flex-row items-center gap-12 max-w-7xl mx-auto">
        <div className="w-full md:w-1/2">
          <img
            src="img/about/a6.jpg"
            alt="Corporate Operations Showcase"
            className="w-full h-auto rounded-lg shadow-md object-cover dark:border dark:border-slate-800"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Who We Are?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
            We are a team of passionate creators, dedicated to delivering
            top-notch products directly to your doorstep. Founded with a vision
            to redefine the online shopping experience, we bring together
            high-quality materials and trendsetting designs. Every product is
            curated with utmost care, ensuring total satisfaction and premium
            value for our community.
          </p>

          <abbr
            title="Our Design Philosophy"
            className="text-sm font-semibold text-teal-600 dark:text-teal-400 cursor-help no-underline"
          >
            Empowering your lifestyle with a perfect blend of modern innovation
            and premium aesthetics.
          </abbr>

          {/* Programmatic Scrolling Promotional Marquee Banner */}
          <div className="w-full bg-gray-200 dark:bg-slate-800 overflow-hidden py-3 rounded-md mt-4 transition-colors">
            <div className="whitespace-nowrap inline-block animate-marquee font-medium text-gray-700 dark:text-gray-300">
              ⚡ Big Sale Live! • Crafting premium experiences with 100% secure
              checkouts and hassle-free returns. • Shop Now!
              &nbsp;&nbsp;&nbsp;&nbsp; ⚡ Big Sale Live! • Crafting premium
              experiences with 100% secure checkouts and hassle-free returns. •
              Shop Now!
            </div>
          </div>
        </div>
      </section>

      {/* Digital Application Delivery Panel */}
      <section className="text-center py-12 bg-gray-50 dark:bg-slate-900/50 px-4 transition-colors">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          Download Our{" "}
          <a
            href="#"
            className="text-teal-600 dark:text-teal-400 hover:underline"
          >
            App
          </a>
        </h1>
        <div className="w-full max-w-4xl mx-auto">
          <video
            autoPlay
            muted
            loop
            src="img/about/1.mp4"
            className="w-full h-full rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800"
          ></video>
        </div>
      </section>

      {/* Core Operational Strengths Section */}
      <div className="py-12 bg-white dark:bg-slate-950 transition-colors">
        <Features />
      </div>
    </div>
  );
};

export default About;
