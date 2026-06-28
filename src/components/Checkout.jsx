import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CreditCard, Truck, ArrowLeft } from "lucide-react";
import axios from "axios";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route state data recovery
  const { checkoutItems = [], totalAmount = 0 } = location.state || {};

  const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Form input state initialized with safe LocalStorage Fallbacks
  const [formData, setFormData] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;
    const address = user?.savedAddress || {};

    return {
      name: address.name || user?.name || "",
      phone: address.phone || user?.phone || "",
      address: address.address || "",
      city: address.city || "",
      pincode: address.pincode || "",
    };
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronous Profile Profile Autofill Pipeline
  useEffect(() => {
    const fetchSavedAddressAndAutofill = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${BACKEND_BASE}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = res.data;
        if (
          userData &&
          (userData.savedAddress || userData.user?.savedAddress)
        ) {
          const addr = userData.savedAddress || userData.user.savedAddress;

          setFormData({
            name: addr.name || userData.name || userData.user?.name || "",
            phone: addr.phone || userData.phone || userData.user?.phone || "",
            address: addr.address || "",
            city: addr.city || "",
            pincode: addr.pincode || "",
          });
        }
      } catch (error) {
        console.error("Autofill Engine Background Error:", error);
      }
    };

    fetchSavedAddressAndAutofill();
  }, [BACKEND_BASE]);

  // Input sanitization filters for structural state mutations
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name" || name === "city") {
      const textOnly = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData((prev) => ({ ...prev, [name]: textOnly }));
    } else if (name === "phone" || name === "pincode") {
      const numbersOnly = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numbersOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Transaction orchestration pipeline
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.pincode
    ) {
      toast.error("Please fill out all delivery fields missing data!");
      return;
    }

    if (checkoutItems.length === 0) {
      toast.error("Your checkout session is empty. Shop first!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication expired. Please login again!");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading(
        paymentMethod === "stripe"
          ? "Opening Stripe Secure Payment Gateway..."
          : "Processing transaction layers on network...",
        { id: "order-pipeline" },
      );

      const orderPayload = {
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
        },
        items: checkoutItems.map((item) => ({
          productId: item.id,
          name: item.name || item.title,
          price: item.price,
          img: item.img,
          quantity: item.quantity || 1,
        })),
        totalAmount: totalAmount,
        paymentMethod: paymentMethod === "stripe" ? "Stripe" : "COD",
      };

      const response = await axios.post(
        `${BACKEND_BASE}/api/orders/place`,
        orderPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.dismiss("order-pipeline");

      if (
        response.data.success ||
        response.status === 200 ||
        response.status === 201
      ) {
        // Pipeline A: Managed Stripe Redirect Logic
        if (paymentMethod === "stripe" && response.data.stripeUrl) {
          toast.success("Redirecting to Stripe Checkout...");
          localStorage.removeItem("cart");
          window.dispatchEvent(new Event("cartUpdated"));
          window.location.href = response.data.stripeUrl;
          return;
        }

        // Pipeline B: Cash On Delivery Integration Logic
        try {
          await axios.delete(`${BACKEND_BASE}/api/cart/clear-all`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (cartClearError) {
          console.error("Database cart cleanup error:", cartClearError);
        }

        toast.success("Order Registered Successfully via COD!");

        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));

        navigate("/order-success", {
          state: {
            orderData: {
              ...formData,
              items: checkoutItems,
              total: totalAmount,
              payment: "Cash On Delivery (Pending)",
              orderId:
                response.data.orderId ||
                "ORD-" + Math.floor(100000 + Math.random() * 900000),
            },
          },
        });
      }
    } catch (error) {
      toast.dismiss("order-pipeline");
      console.error("Order Engine Error Response Logging:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to process target order via cloud layers.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <p className="text-sm font-semibold text-zinc-500 mb-4">
          No active items found for checkout workflow.
        </p>
        <button
          onClick={() => navigate("/cart")}
          className="bg-[#088178] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          Return To Cart Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 pt-28 pb-16 px-4 sm:px-6 md:px-12 lg:px-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-[#088178] dark:hover:text-teal-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Return to Cart
        </button>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-4 text-zinc-950 dark:text-white">
          Secure Checkout
        </h1>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Logistics Information Input Panel */}
        <form
          onSubmit={handlePlaceOrder}
          className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-6 sm:p-8 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col gap-6"
        >
          <h3 className="text-base font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            1. Shipping & Logistics Address
          </h3>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Full Name
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your Name"
              className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#088178]/20 focus:border-[#088178] dark:focus:border-teal-500 transition-all font-medium"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Phone Number
            </label>
            <input
              required
              type="text"
              inputMode="numeric"
              maxLength="12"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Your Phone Number"
              className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#088178]/20 focus:border-[#088178] dark:focus:border-teal-500 transition-all font-medium"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Street Address
            </label>
            <textarea
              required
              rows="3"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Your Full Address (House No, Street, Area...)"
              className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#088178]/20 focus:border-[#088178] dark:focus:border-teal-500 transition-all font-medium resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                City
              </label>
              <input
                required
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Your City"
                className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#088178]/20 focus:border-[#088178] dark:focus:border-teal-500 transition-all font-medium"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Pincode
              </label>
              <input
                required
                type="text"
                inputMode="numeric"
                maxLength="6"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Your Pincode"
                className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#088178]/20 focus:border-[#088178] dark:focus:border-teal-500 transition-all font-medium"
              />
            </div>
          </div>

          <h3 className="text-base font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 pb-2 border-b border-zinc-100 dark:border-zinc-800 mt-4">
            2. Choose Payment Mode
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cash on Delivery Interface Component */}
            <div
              onClick={() => setPaymentMethod("cod")}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === "cod"
                  ? "border-[#088178] bg-[#e8f6ea]/30 dark:border-teal-500 dark:bg-teal-950/20"
                  : "border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck
                  className={
                    paymentMethod === "cod"
                      ? "text-[#088178] dark:text-teal-400"
                      : "text-zinc-400"
                  }
                  size={20}
                />
                <div>
                  <p className="text-sm font-bold">Cash on Delivery</p>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Pay on cargo delivery
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "cod"
                    ? "border-[#088178] dark:border-teal-400"
                    : "border-zinc-300"
                }`}
              >
                {paymentMethod === "cod" && (
                  <div className="w-2 h-2 rounded-full bg-[#088178] dark:bg-teal-400" />
                )}
              </div>
            </div>

            {/* Gateway Stripe Interface Component */}
            <div
              onClick={() => setPaymentMethod("stripe")}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === "stripe"
                  ? "border-[#088178] bg-[#e8f6ea]/30 dark:border-teal-500 dark:bg-teal-950/20"
                  : "border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard
                  className={
                    paymentMethod === "stripe"
                      ? "text-[#088178] dark:text-teal-400"
                      : "text-zinc-400"
                  }
                  size={20}
                />
                <div>
                  <p className="text-sm font-bold">Pay Now</p>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Sandbox testing gateway
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "stripe"
                    ? "border-[#088178] dark:border-teal-400"
                    : "border-zinc-300"
                }`}
              >
                {paymentMethod === "stripe" && (
                  <div className="w-2 h-2 rounded-full bg-[#088178] dark:bg-teal-400" />
                )}
              </div>
            </div>
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-[#088178] hover:bg-[#06665f] dark:bg-teal-600 dark:hover:bg-teal-500 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-xs mt-4 active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? "Processing Order..." : "Order Now"}
          </button>
        </form>

        {/* Order Preview Panel Side Grid */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-6 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] sticky top-28">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
            Items Review Summary
          </h3>

          <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/50 pr-2 custom-scrollbar">
            {checkoutItems.map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-100 dark:border-zinc-800">
                  <img
                    src={item.img}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">
                    {item.title || item.name}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-medium font-mono">
                    Qty: {item.quantity || 1}
                  </p>
                </div>
                <p className="text-xs font-bold font-mono">
                  ₹{(item.price * (item.quantity || 1)).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3 text-xs font-medium">
            <div className="flex justify-between text-zinc-400">
              <span>Items Subtotal</span>
              <span className="font-bold font-mono text-zinc-700 dark:text-zinc-300">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Logistics Delivery</span>
              <span className="text-emerald-500 font-bold tracking-wider uppercase text-[10px] bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                Complimentary
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-zinc-950 dark:text-white">
              <span>Final Total Bill</span>
              <span className="text-base font-black text-[#088178] dark:text-teal-400 font-mono">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
