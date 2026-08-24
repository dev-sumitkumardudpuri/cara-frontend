import React, { useState, useEffect } from "react";
import { FiX, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  // Reset form states on component lifecycle visibility changes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", email: "", password: "" });
      setShowPassword(false);
    }
  }, [isOpen]);

  // Google OAuth Authorization Pipeline
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        toast.loading("Verifying your Google identity securely...", {
          id: "google-auth",
        });

        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );

        const userInfo = userInfoResponse.data;

        const response = await axios.post(
          `${BACKEND_BASE}/api/auth/google-login`,
          {
            name: userInfo.name || "Google Guest",
            email: userInfo.email,
          },
        );

        const data = response.data;
        toast.dismiss("google-auth");

        if (data.success) {
          toast.success(data.message || "Login Successful!");

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          if (onLoginSuccess) {
            onLoginSuccess(data.user);
          }

          window.dispatchEvent(new Event("cartUpdated"));
          onClose();
        } else {
          toast.error(data.message || "Failed to log in.");
        }
      } catch (error) {
        toast.dismiss("google-auth");
        console.error("Google Profile Extraction Error:", error);
        toast.error("Failed to collect security info from Google nodes.");
      }
    },
    onError: (error) => {
      console.error("Google Client Trigger Failure:", error);
      toast.error("Google authentication process was rejected or cancelled.");
    },
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Standard Credentials Authentication Process
  const handleSubmit = async (e) => {
    e.preventDefault();

    const submissionData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    if (
      !submissionData.email ||
      !submissionData.password ||
      (isSignup && !submissionData.name)
    ) {
      toast.error("Please fill all fields properly!");
      return;
    }

    setLoading(true);
    const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";

    try {
      const response = await axios.post(
        `${BACKEND_BASE}${endpoint}`,
        submissionData,
      );
      const data = response.data;

      if (data.success) {
        toast.success(data.message);

        if (isSignup) {
          setIsSignup(false);
          setFormData({ name: "", email: submissionData.email, password: "" });
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          if (onLoginSuccess) onLoginSuccess(data.user);

          window.dispatchEvent(new Event("cartUpdated"));
          onClose();
        }
      } else {
        toast.error(data.message || "Authentication failed!");
      }
    } catch (error) {
      console.error(error);
      const serverMessage = error.response?.data?.message;
      toast.error(serverMessage || "Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-2xl border border-zinc-100 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
        >
          <FiX size={22} />
        </button>

        <h2 className="text-2xl font-bold text-center text-zinc-800 dark:text-zinc-100 tracking-wide">
          {isSignup ? "CREATE ACCOUNT" : "WELCOME BACK"}
        </h2>

        {/* Input Form Elements */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isSignup && (
            <div className="relative">
              <FiUser className="absolute left-3 top-3.5 text-zinc-400" />
              <input
                type="text"
                name="name"
                required={isSignup}
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 dark:border-zinc-700 bg-transparent rounded-lg text-sm focus:outline-none focus:border-[#088178] dark:text-white"
              />
            </div>
          )}

          <div className="relative">
            <FiMail className="absolute left-3 top-3.5 text-zinc-400" />
            <input
              type="email"
              name="email"
              required
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-zinc-200 dark:border-zinc-700 bg-transparent rounded-lg text-sm focus:outline-none focus:border-[#088178] dark:text-white"
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-3.5 text-zinc-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-12 py-3 border border-zinc-200 dark:border-zinc-700 bg-transparent rounded-lg text-sm focus:outline-none focus:border-[#088178] dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#088178] text-white font-semibold text-sm hover:bg-[#06635c] transition-colors cursor-pointer shadow-md disabled:opacity-50"
          >
            {loading ? "PROCESSING..." : isSignup ? "SIGN UP" : "LOG IN"}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-5">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="absolute bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400">
            OR
          </span>
        </div>

        {/* Federated Identity Provider Triggers */}
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"
            />
            <path
              fill="#4285F4"
              d="M16.04 15.345c-1.077.733-2.418 1.164-4.04 1.164-2.955 0-5.464-1.991-6.355-4.673L1.609 14.95C3.582 18.882 7.664 21.6 12 21.6c3.155 0 6.027-1.127 8.19-3.055l-4.15-3.2z"
            />
            <path
              fill="#34A853"
              d="M23.49 12.273c0-.773-.073-1.527-.2-2.273H12v4.51h6.464a5.532 5.532 0 01-2.4 3.636l4.15 3.2c2.427-2.236 3.827-5.527 3.827-9.073z"
            />
            <path
              fill="#FBBC05"
              d="M5.645 11.836A6.938 6.938 0 015.455 10c0-.636.1-1.255.264-1.845L1.69 5.04A11.94 11.94 0 000 10c0 1.745.373 3.4 1.045 4.91l4.6-3.073z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* View State Toggle Links */}
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-6">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-[#088178] font-semibold hover:underline cursor-pointer"
          >
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </p>
        <p
          className="font-bold"
          style={{ fontSize: "12px", color: "gray", marginTop: "10px" }}
        >
          Demo Credentials: <br /> User: user@gmail.com Password: user <br />
          Admin: admin@gmail.com Password: admin
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
