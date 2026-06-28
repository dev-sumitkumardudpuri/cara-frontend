import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle,
  ShoppingBag,
  MapPin,
  CreditCard,
  Loader2,
  XCircle,
} from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");
  const orderIdFromUrl = searchParams.get("order_id");

  const [loading, setLoading] = useState(!!sessionId);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [orderData, setOrderData] = useState(location.state?.orderData || null);

  const triggered = useRef(false);

  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  useEffect(() => {
    if (sessionId && orderIdFromUrl && !triggered.current) {
      triggered.current = true;

      const verifyPayment = async () => {
        try {
          const token = localStorage.getItem("token");

          const response = await axios.post(
            `${BACKEND_BASE}/api/orders/verify-stripe`,
            { session_id: sessionId, order_id: orderIdFromUrl },
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            },
          );

          if (response.data.success && response.data.order) {
            const dbOrder = response.data.order;

            setOrderData({
              orderId: dbOrder.orderId,
              name: dbOrder.shippingAddress?.name || "Premium Buyer",
              address: dbOrder.shippingAddress?.address || "Saved Address",
              city: dbOrder.shippingAddress?.city || "",
              pincode: dbOrder.shippingAddress?.pincode || "",
              phone: dbOrder.shippingAddress?.phone || "",
              payment: "Stripe Online Card",
              total: dbOrder.totalAmount,
            });

            localStorage.removeItem("cartItems");
            window.dispatchEvent(new Event("cartUpdated"));
          } else {
            setVerificationFailed(true);
          }
        } catch (error) {
          console.error("Stripe Checkout Status Verification Error:", error);
          setVerificationFailed(true);
        } finally {
          setLoading(false);
        }
      };

      verifyPayment();
    }
  }, [sessionId, orderIdFromUrl, BACKEND_BASE]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <Loader2 className="w-12 h-12 text-[#088178] animate-spin mb-4" />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
          Verifying Secure Stripe Payment...
        </h2>
        <p className="text-xs font-semibold text-zinc-500">
          Please do not refresh or close this window context.
        </p>
      </div>
    );
  }

  if (verificationFailed) {
    return (
      <div className="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-5">
          <XCircle size={40} />
        </div>
        <h2 className="text-xl font-black text-zinc-950 dark:text-white mb-2">
          Payment Verification Failed!
        </h2>
        <p className="text-sm font-medium text-zinc-500 text-center max-w-sm mb-6">
          We couldn't confirm your transaction with Stripe. If money was
          deducted, please contact support.
        </p>
        <button
          onClick={() => navigate("/cart")}
          className="bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <p className="text-sm font-semibold text-zinc-500 mb-4">
          No active order session found.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#088178] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Go To Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 pt-28 pb-16 px-4 sm:px-6 md:px-12 lg:px-20 transition-colors duration-300 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-6 sm:p-10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] text-center">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
          <CheckCircle size={40} strokeWidth={2.5} />
        </div>

        <p className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full inline-block mb-2">
          {sessionId ? "Stripe Online Paid" : "COD Order Logged"}
        </p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white mb-2">
          Thank you for your purchase!
        </h1>
        <p className="text-sm text-zinc-400 font-medium max-w-md mx-auto mb-6">
          Your order has been logged inside our systems and is currently
          processing for dispatch logistics.
        </p>

        <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800/60 inline-flex items-center gap-2 mb-8">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Order ID:
          </span>
          <span className="text-xs font-mono font-black text-zinc-950 dark:text-white tracking-wide">
            {orderData.orderId}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left border-t border-b border-zinc-100 dark:border-zinc-800 py-6 mb-8 text-xs font-medium">
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <MapPin size={14} className="text-[#088178] dark:text-teal-400" />{" "}
              Delivery Logistics
            </span>
            <p className="font-bold text-zinc-950 dark:text-white">
              {orderData.name}
            </p>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed truncate">
              {orderData.address} {orderData.city ? `, ${orderData.city}` : ""}{" "}
              {orderData.pincode ? `- ${orderData.pincode}` : ""}
            </p>
            {orderData.phone && (
              <p className="text-zinc-400 font-mono">{orderData.phone}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 sm:border-l sm:border-zinc-100 sm:dark:border-zinc-800 sm:pl-6">
            <span className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <CreditCard
                size={14}
                className="text-[#088178] dark:text-teal-400"
              />{" "}
              Payment Pipeline
            </span>
            <p className="font-bold text-zinc-950 dark:text-white">
              {orderData.payment}
            </p>
            <p className="text-zinc-400 mt-auto">Total Settled Bill:</p>
            <p className="text-base font-black text-[#088178] dark:text-teal-400 font-mono">
              {typeof orderData.total === "number"
                ? `₹${orderData.total.toLocaleString("en-IN")}`
                : orderData.total}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-[#088178] hover:bg-[#06665f] dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag size={16} /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
