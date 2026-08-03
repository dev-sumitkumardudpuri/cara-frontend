import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  const handlePlaceholderClick = (e) => {
    e.preventDefault();
  };

  return (
    <footer className="w-full px-6 sm:px-12 md:px-20 pt-16 pb-8 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      {/* Core Metadata Distribution Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
        {/* Column 1: Corporate Identity & Communication Channels */}
        <div className="flex flex-col items-start text-left space-y-4">
          <img
            className="h-8 w-auto object-contain mb-6 dark:invert transition-all duration-300"
            src="/img/logo.png"
            alt="Application Architecture Logo"
          />

          <div className="w-full">
            <h4 className="text-[16px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3">
              Contact
            </h4>
            <div className="space-y-2.5 text-zinc-600 dark:text-zinc-400 text-sm sm:text-[15px] leading-relaxed">
              <p>
                <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                  Address:{" "}
                </strong>
                S62 Washington Road, Street 14, New Delhi
              </p>
              <p>
                <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                  Phone:{" "}
                </strong>
                +01 2222 345 / (+91) 123456789
              </p>
              <p>
                <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                  Hours:{" "}
                </strong>
                10:00 - 18:00, Mon - Sat
              </p>
            </div>
          </div>

          {/* Social Media Syndication Hub */}
          <div className="pt-2 w-full">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3">
              Follow Us
            </h4>
            <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
              <a
                href="#"
                onClick={handlePlaceholderClick}
                className="hover:text-[#088178] dark:hover:text-[#0bd1c3] transition-all duration-200 transform hover:-translate-y-1"
              >
                <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="#"
                onClick={handlePlaceholderClick}
                className="hover:text-[#088178] dark:hover:text-[#0bd1c3] transition-all duration-200 transform hover:-translate-y-1"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                onClick={handlePlaceholderClick}
                className="hover:text-[#088178] dark:hover:text-[#0bd1c3] transition-all duration-200 transform hover:-translate-y-1"
              >
                <svg
                  className="w-5.5 h-5.5 stroke-current fill-none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="#"
                onClick={handlePlaceholderClick}
                className="hover:text-[#088178] dark:hover:text-[#0bd1c3] transition-all duration-200 transform hover:-translate-y-1"
              >
                <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Column 2: Platform Links */}
        <div className="flex flex-col items-start text-left">
          <h4 className="text-[16px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">
            About
          </h4>
          <div className="flex flex-col space-y-3 text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-400 font-medium w-full">
            <a
              href="#"
              onClick={handlePlaceholderClick}
              className="hover:text-[#088178] dark:hover:text-[#0bd1c3] hover:pl-1 transition-all duration-200 block"
            >
              About Us
            </a>
            <a
              href="#"
              onClick={handlePlaceholderClick}
              className="hover:text-[#088178] dark:hover:text-[#0bd1c3] hover:pl-1 transition-all duration-200 block"
            >
              Delivery Information
            </a>
            <a
              href="#"
              onClick={handlePlaceholderClick}
              className="hover:text-[#088178] dark:hover:text-[#0bd1c3] hover:pl-1 transition-all duration-200 block"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              onClick={handlePlaceholderClick}
              className="hover:text-[#088178] dark:hover:text-[#0bd1c3] hover:pl-1 transition-all duration-200 block"
            >
              Terms & Conditions
            </a>
            <a
              href="#"
              onClick={handlePlaceholderClick}
              className="hover:text-[#088178] dark:hover:text-[#0bd1c3] hover:pl-1 transition-all duration-200 block"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Column 3: Profile & Client Portal Channels */}
        <div className="flex flex-col items-start text-left">
          <h4 className="text-[16px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">
            My Account
          </h4>
          <div className="flex flex-col space-y-3 text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-400 font-medium w-full">
            <a
              href="#"
              onClick={handlePlaceholderClick}
              className="hover:text-[#088178] dark:hover:text-[#0bd1c3] hover:pl-1 transition-all duration-200 block"
            >
              Sign In
            </a>
            <a
              href="#"
              onClick={handlePlaceholderClick}
              className="hover:text-[#088178] dark:hover:text-[#0bd1c3] hover:pl-1 transition-all duration-200 block"
            >
              View Cart
            </a>
            <a
              href="#"
              onClick={handlePlaceholderClick}
              className="hover:text-[#088178] dark:hover:text-[#0bd1c3] hover:pl-1 transition-all duration-200 block"
            >
              My Wishlist
            </a>
            <a
              href="#"
              onClick={handlePlaceholderClick}
              className="hover:text-[#088178] dark:hover:text-[#0bd1c3] hover:pl-1 transition-all duration-200 block"
            >
              Track My Order
            </a>
            <a
              href="#"
              onClick={handlePlaceholderClick}
              className="hover:text-[#088178] dark:hover:text-[#0bd1c3] hover:pl-1 transition-all duration-200 block"
            >
              Help
            </a>
          </div>
        </div>

        {/* Column 4: Native Gateways & Credentials */}
        <div className="flex flex-col items-start text-left space-y-3 w-full">
          <h4 className="text-[16px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
            Install App
          </h4>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-[15px]">
            From App Store or Google Play
          </p>

          <div className="flex flex-row flex-wrap gap-3 pt-1 w-full max-w-xs">
            <img
              src="/img/pay/app.jpg"
              alt="App Store Execution File Node"
              onClick={handlePlaceholderClick}
              className="h-11 w-auto rounded-md border border-[#cce7d0] dark:border-zinc-700 cursor-pointer hover:border-[#088178] dark:hover:border-[#0bd1c3] transition-colors object-contain"
            />
            <img
              src="/img/pay/play.jpg"
              alt="Google Play Android Package Target"
              onClick={handlePlaceholderClick}
              className="h-11 w-auto rounded-md border border-[#cce7d0] dark:border-zinc-700 cursor-pointer hover:border-[#088178] dark:hover:border-[#0bd1c3] transition-colors object-contain"
            />
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-[15px] pt-3">
            Secured Payment Gateways
          </p>
          <img
            src="/img/pay/pay.png"
            alt="Verified Payment Rails"
            className="h-8 w-auto max-w-full object-contain pt-1"
          />
        </div>
      </div>

      {/* Corporate Compliance Disclaimer Footer */}
      <div className="w-full pt-6 border-t border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 text-sm font-medium flex flex-col md:flex-row justify-between items-center gap-2">
        {/* Left Side: Copyright Text */}
        <p className="tracking-wide">
          &copy; {currentYear},{" "}
          <span className="text-[#088178] dark:text-[#0bd1c3] font-bold">
            CARA
          </span>{" "}
          — Ecommerce. All rights reserved.
        </p>

        {/* <p className="text-xm text-zinc-400 dark:text-zinc-500">
          Available on{" "}
          <a
            href="https://www.codester.com/items/67173/mern-stack-clothing-e-commerce-platform?ref=wad10"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#088178] dark:text-[#0bd1c3] underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Codester
          </a>
        </p> */}
      </div>
    </footer>
  );
}

export default Footer;
