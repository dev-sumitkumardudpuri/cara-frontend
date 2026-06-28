import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiShoppingCart,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import AuthModal from "./AuthModal";
import { toast } from "react-hot-toast";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  // Ref locks to absolute block double triggering or race conditions
  const isMergingRef = useRef(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  // Monitor and synchronize authenticated user identity state properties
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Error parsing user context:", e);
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  }, [isAuthModalOpen]);

  // Synchronize cart item metrics with persistence layers or storage fallbacks
  const syncUniqueCartBadge = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      // Strict API invocation validation lock execution
      if (isMergingRef.current) return;

      try {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];

        // Execute batch merge operation if unauthenticated cart sessions contain items
        if (savedCart.length > 0) {
          isMergingRef.current = true;
          await axios.post(
            `${BACKEND_BASE}/api/cart/merge`,
            { localCartItems: savedCart },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          localStorage.removeItem("cart");
        }

        // Fetch current active item quantities from database documents
        const response = await axios.get(`${BACKEND_BASE}/api/cart/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.items) {
          setCartItemsCount(response.data.items.length);
        } else if (response.data && response.data.cart?.items) {
          setCartItemsCount(response.data.cart.items.length);
        }
      } catch (error) {
        console.error("Cart badge synchronization disrupted:", error);
      } finally {
        isMergingRef.current = false;
      }
    } else {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItemsCount(savedCart.length);
    }
  };

  // Safe side effect triggers without cascading requests
  useEffect(() => {
    syncUniqueCartBadge();

    window.addEventListener("cartUpdated", syncUniqueCartBadge);
    window.addEventListener("storage", syncUniqueCartBadge);

    return () => {
      window.removeEventListener("cartUpdated", syncUniqueCartBadge);
      window.removeEventListener("storage", syncUniqueCartBadge);
    };
  }, [location.pathname, isLoggedIn]);

  // Fallback pooling interval targeting unauthenticated localStorage mutation variants
  useEffect(() => {
    const interval = setInterval(() => {
      if (!localStorage.getItem("token")) {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItemsCount(savedCart.length);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync document interface rendering properties based on layout theme choices
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Manage application viewport scroll layout attributes depending on navigation overlay states
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  // Execution workflow parsing post success auth callback routines
  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);

    await syncUniqueCartBadge();
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Revoke session properties and flush cache environments on logout invocation
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setIsLoggedIn(false);
    setUser(null);
    setCartItemsCount(0);

    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Logged out successfully.");
    navigate("/");
  };

  const navLinkStyle = ({ isActive }) => {
    return `relative pb-1 font-semibold text-[15px] tracking-wide transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[#088178] after:transition-transform after:duration-300 ${
      isActive
        ? "text-[#088178] after:scale-x-100"
        : "text-zinc-800 dark:text-zinc-200 hover:text-[#088178] dark:hover:text-[#088178] after:scale-x-0 hover:after:scale-x-100"
    }`;
  };

  const mobileNavLinkStyle = ({ isActive }) => {
    return `block text-base font-medium p-2 rounded-md transition-colors ${
      isActive
        ? "text-[#088178] bg-zinc-200/50 dark:bg-zinc-800/50 font-semibold"
        : "text-zinc-800 dark:text-zinc-200 hover:text-[#088178]"
    }`;
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#e3e6f3] dark:bg-[#1a1d20] shadow-[0_5px_15px_rgba(0,0,0,0.06)] dark:shadow-[0_5px_15px_rgba(0,0,0,0.2)] border-b border-transparent dark:border-zinc-800/80 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="shrink-0">
              <Link to="/">
                <img
                  src="/img/logo.png"
                  alt="Application Architecture Logo"
                  className="h-10 w-auto object-contain dark:invert"
                />
              </Link>
            </div>

            {/* Desktop Navigation Environment */}
            <div className="hidden md:flex items-center space-x-8 ml-auto">
              <div className="flex space-x-6">
                <NavLink to="/" className={navLinkStyle}>
                  HOME
                </NavLink>
                <NavLink to="/shop" className={navLinkStyle}>
                  SHOP
                </NavLink>
                <NavLink to="/about" className={navLinkStyle}>
                  ABOUT
                </NavLink>
                <NavLink to="/contact" className={navLinkStyle}>
                  CONTACT
                </NavLink>
              </div>

              <Link
                to="/cart"
                className="relative text-zinc-800 dark:text-zinc-200 hover:text-[#088178] p-1.5 inline-block"
              >
                <FiShoppingCart size={22} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#088178] text-[9px] font-black text-white font-mono shadow-sm animate-fade-in">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="text-zinc-800 dark:text-zinc-200 hover:text-[#088178] cursor-pointer"
              >
                {darkMode ? (
                  <FiSun size={22} className="text-yellow-400" />
                ) : (
                  <FiMoon size={22} />
                )}
              </button>

              <div className="flex items-center space-x-4">
                {isLoggedIn ? (
                  <>
                    <Link
                      to={
                        user?.role === "admin"
                          ? "/admin/dashboard"
                          : "/dashboard"
                      }
                      className="flex items-center gap-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#088178] transition-colors bg-zinc-100/80 dark:bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50"
                    >
                      <FiUser size={16} className="text-[#088178]" />
                      Hi,{" "}
                      <span className="text-[#088178] font-bold">
                        {user?.name}
                      </span>
                      {user?.role === "admin" && (
                        <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 px-1.5 py-0.5 rounded ml-1 font-bold">
                          ADMIN
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-zinc-500 hover:text-red-500 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Logout"
                    >
                      <FiLogOut size={18} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-5 py-2 border border-[#088178] text-[#088178] bg-transparent hover:bg-[#088178] hover:text-white rounded-md text-sm font-semibold transition-all duration-300 cursor-pointer tracking-wider"
                  >
                    LOGIN
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Controls Viewport */}
            <div className="flex md:hidden items-center space-x-5">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="text-zinc-800 dark:text-zinc-200"
              >
                {darkMode ? (
                  <FiSun size={22} className="text-yellow-400" />
                ) : (
                  <FiMoon size={22} />
                )}
              </button>
              <Link
                to="/cart"
                className="relative text-zinc-800 dark:text-zinc-200 p-1"
              >
                <FiShoppingCart size={22} />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#088178] text-[9px] font-black text-white font-mono shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                {isOpen ? <FiX size={26} /> : <FiMenu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Panel Overlay */}
        {isOpen && (
          <div className="md:hidden bg-[#e3e6f3] dark:bg-[#1a1d20] border-t border-zinc-300 dark:border-zinc-800 px-6 pt-4 pb-6 space-y-4 shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto">
            <NavLink
              to="/"
              className={mobileNavLinkStyle}
              onClick={() => setIsOpen(false)}
            >
              HOME
            </NavLink>
            <NavLink
              to="/shop"
              className={mobileNavLinkStyle}
              onClick={() => setIsOpen(false)}
            >
              SHOP
            </NavLink>
            <NavLink
              to="/about"
              className={mobileNavLinkStyle}
              onClick={() => setIsOpen(false)}
            >
              ABOUT
            </NavLink>
            <NavLink
              to="/contact"
              className={mobileNavLinkStyle}
              onClick={() => setIsOpen(false)}
            >
              CONTACT
            </NavLink>

            <hr className="border-zinc-300 dark:border-zinc-800" />

            {isLoggedIn ? (
              <div className="flex justify-between items-center pt-2 px-2">
                <Link
                  to={
                    user?.role === "admin" ? "/admin/dashboard" : "/dashboard"
                  }
                  className="text-base font-medium text-[#088178]"
                  onClick={() => setIsOpen(false)}
                >
                  Profile ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-red-500"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="px-2">
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full py-2.5 border border-[#088178] text-[#088178] rounded-md text-sm font-semibold bg-white dark:bg-zinc-800"
                >
                  LOGIN
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default Navbar;
