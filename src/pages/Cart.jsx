import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Environment-specific backend API base URL
  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  /**
   * Synchronizes and loads cart datasets from cloud database (MongoDB)
   * or falls back to local storage cache based on authentication state.
   */
  const loadCartData = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_BASE}/api/cart/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          const targetItems =
            response.data.items || response.data.cart?.items || [];
          const normalizedData = targetItems.map((item) => ({
            id: item.productId,
            img: item.img,
            title: item.name,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }));
          setCartItems(normalizedData);
        }
      } catch (error) {
        console.error("Database cart collection retrieval error:", error);
        toast.error("Failed to synchronize cloud-based cart data.");
      } finally {
        setLoading(false);
      }
    } else {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(savedCart);
    }
  };

  // Registers reactive listeners for systemic cart synchronizations
  useEffect(() => {
    loadCartData();

    window.addEventListener("cartUpdated", loadCartData);

    return () => {
      window.removeEventListener("cartUpdated", loadCartData);
    };
  }, []);

  /**
   * Processes runtime quantity updates with an optimistic UI update
   * state pipeline and updates the cloud database or local database cache.
   */
  const handleQuantityChange = async (id, val) => {
    const qty = Math.max(1, parseInt(val) || 1);
    const token = localStorage.getItem("token");

    const previousItems = [...cartItems];
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item)),
    );

    if (token) {
      try {
        const targetItem = previousItems.find((item) => item.id === id);
        if (!targetItem) return;

        await axios.post(
          `${BACKEND_BASE}/api/cart/add`,
          {
            productId: id.toString(),
            name: targetItem.title || targetItem.name,
            price: targetItem.price,
            img: targetItem.img,
            quantity: qty - targetItem.quantity,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (error) {
        console.error("Cloud item quantity mutation error:", error);
        toast.error(
          "Failed to synchronize item adjustments to cloud workspace.",
        );
        setCartItems(previousItems);
      }
    } else {
      const updatedCart = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: qty } : item,
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  /**
   * Processes the deletion of specific target line items from the persistent layer,
   * utilizing formal REST delete endpoints with a POST transactional delta fallback.
   */
  const handleRemoveItem = async (id) => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        toast.loading("Removing product line item...", {
          id: "remove-operation",
        });

        const response = await axios.delete(
          `${BACKEND_BASE}/api/cart/remove/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        toast.dismiss("remove-operation");
        if (response.data.success || response.status === 200) {
          toast.success("Item successfully removed from cloud cart.");
          setCartItems((prev) => prev.filter((item) => item.id !== id));
          window.dispatchEvent(new Event("cartUpdated"));
        } else {
          throw new Error("Primary deletion pathway failure.");
        }
      } catch (error) {
        try {
          const targetItem = cartItems.find((item) => item.id === id);
          const response = await axios.post(
            `${BACKEND_BASE}/api/cart/add`,
            {
              productId: id.toString(),
              quantity: -Number(targetItem?.quantity || 1),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          toast.dismiss("remove-operation");
          if (response.data.success) {
            toast.success("Item successfully removed from cloud cart.");
            setCartItems((prev) => prev.filter((item) => item.id !== id));
            window.dispatchEvent(new Event("cartUpdated"));
          }
        } catch (fallbackError) {
          toast.dismiss("remove-operation");
          console.error(
            "Transactional deletion rollback processing failure:",
            fallbackError,
          );
          toast.error(
            "Unable to complete item removal from your cloud account.",
          );
        }
      }
    } else {
      const updatedCart = cartItems.filter((item) => item.id !== id);
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      toast.success("Item removed from temporary space.");
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0,
  );

  /**
   * Evaluates valid operational parameters prior to dispatching
   * customer state vectors into secure checkout micro-routing pipelines.
   */
  const handleCheckout = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(
        "Authentication required. Please log in to complete your transaction.",
      );
      return;
    }

    toast.success("Initializing secure payment validation pipeline...");

    navigate("/checkout", {
      state: {
        checkoutItems: cartItems,
        totalAmount: cartSubtotal,
      },
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#fcfcfc] dark:bg-slate-950 flex items-center justify-center">
        <p className="text-sm font-semibold tracking-widest animate-pulse text-teal-600">
          SYNCHRONIZING SECURE WORKSPACE CONFIGURATIONS...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fcfcfc] dark:bg-slate-950 text-gray-800 dark:text-gray-100 transition-colors duration-300 min-h-screen">
      {/* Decorative Branding Banner */}
      <section
        id="page-header"
        className="w-full h-[35vh] bg-cover bg-center flex flex-col justify-center text-center p-6 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('img/about/banner.png')`,
        }}
      >
        <div className="z-10 tracking-wide">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-3 drop-shadow-sm">
            #YourCart
          </h2>
        </div>
      </section>

      {cartItems.length === 0 ? (
        /* Empty Vector Feedback View */
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            Your cart workspace is currently empty
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-[#088178] text-white font-bold px-8 py-3.5 rounded-lg shadow-sm hover:bg-[#06665f] hover:shadow-[0_8px_20px_rgba(8,129,120,0.3)] transition-all duration-300 tracking-wider text-xs uppercase cursor-pointer"
          >
            Explore Shop
          </button>
        </div>
      ) : (
        /* Tabular Layout Matrix */
        <div className="max-w-7xl mx-auto px-4 py-16 md:px-8 lg:px-12 flex flex-col gap-12">
          <section
            id="cart"
            className="w-full overflow-x-auto bg-white dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow-[0_4px_25px_rgba(0,0,0,0.02)]"
          >
            <table className="w-full min-w-225 border-collapse table-fixed white-space-nowrap">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 dark:text-gray-400 font-semibold uppercase text-[11px] tracking-widest bg-gray-50/50 dark:bg-slate-900/80">
                  <td className="w-25 text-center py-5">Remove</td>
                  <td className="w-32.5 text-center py-5">Image</td>
                  <td className="w-67.5 text-left py-5 pl-4">
                    Product Details
                  </td>
                  <td className="w-37.5 text-center py-5">Price</td>
                  <td className="w-37.5 text-center py-5">Quantity</td>
                  <td className="w-37.5 text-center py-5">Subtotal</td>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {cartItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/40 dark:hover:bg-slate-900/20 transition-all duration-200 group"
                  >
                    <td className="w-25 text-center py-6">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 inline-flex items-center justify-center group-hover:scale-105 cursor-pointer"
                        title="Remove Item"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </td>

                    <td className="w-32.5 text-center py-4">
                      <div className="w-18.75 h-23.75 rounded-xl overflow-hidden mx-auto bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 shadow-sm group-hover:shadow transition-shadow">
                        <img
                          src={item.img}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </td>

                    <td className="w-67.5 text-left py-6 font-medium text-[14px] text-gray-900 dark:text-gray-100 pl-4">
                      <p className="truncate pr-4 font-semibold hover:text-[#088178] dark:hover:text-teal-400 cursor-pointer transition-colors">
                        {item.title || item.name}
                      </p>
                      <span className="text-[11px] text-gray-400 block mt-1 font-mono uppercase">
                        ID: #{item.id?.toString().slice(-6) || "N/A"}
                      </span>
                    </td>

                    <td className="w-37.5 text-center py-6 font-medium text-[14px] text-gray-600 dark:text-gray-300 font-mono">
                      ₹{item.price.toLocaleString("en-IN")}
                    </td>

                    <td className="w-37.5 text-center py-6">
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                          className="w-16.25 border border-gray-200 dark:border-slate-800 text-center rounded-lg py-1.5 px-2 bg-gray-50/50 dark:bg-slate-900 text-sm font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-[#088178]/20 focus:border-[#088178] dark:focus:border-teal-500"
                        />
                      </div>
                    </td>

                    <td className="w-37.5 text-center py-6 font-bold text-[14px] text-gray-900 dark:text-white font-mono">
                      ₹
                      {(item.price * (item.quantity || 1)).toLocaleString(
                        "en-IN",
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Secure Aggregation Structural Details */}
          <section
            id="cart-add"
            className="w-full flex flex-wrap lg:flex-nowrap justify-between items-start gap-8"
          >
            <div className="w-full lg:w-[45%] p-6 rounded-2xl bg-linear-to-br from-gray-50 to-gray-100/50 dark:from-slate-900/60 dark:to-slate-900/20 border border-gray-100 dark:border-slate-800/60">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-gray-700 dark:text-gray-300">
                Safe & Secure Logistics
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enjoy complimentary global carbon-neutral shipping on your
                entire selection. Your purchase is guarded with top-tier
                verified high-grade encryption systems.
              </p>
            </div>

            <div
              id="subtotal"
              className="w-full lg:w-[50%] border border-gray-100 dark:border-slate-800/80 p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.01)]"
            >
              <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                Order Summary
              </h3>

              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-slate-800/50 pb-3">
                  <span className="text-gray-500 dark:text-gray-400">
                    Cart Subtotal
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white font-mono">
                    ₹{cartSubtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-slate-800/50 pb-3">
                  <span className="text-gray-500 dark:text-gray-400">
                    Shipping Estimate
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[11px] tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    Complimentary
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    Estimated Total
                  </span>
                  <span className="text-xl font-black text-[#088178] dark:text-teal-400 font-mono">
                    ₹{cartSubtotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-[#088178] text-white py-4 px-6 font-bold rounded-xl shadow-md hover:bg-[#06665f] hover:shadow-[0_10px_25px_rgba(8,129,120,0.35)] active:scale-[0.99] transition-all duration-300 tracking-widest uppercase text-xs border border-transparent cursor-pointer"
              >
                Proceed To Checkout
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Cart;
