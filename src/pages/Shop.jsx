import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ALL_PRODUCTS } from "../products";

const Shop = () => {
  const navigate = useNavigate();

  // Environment-specific backend API base URL
  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  /**
   * Handles adding products to cart.
   * Synchronizes with database if authenticated, otherwise falls back to local storage.
   */
  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");

    if (token) {
      // Flow 1: Authenticated User (Database Sync)
      try {
        toast.loading("Updating your cart...", {
          id: "cart-sync-shop",
        });

        const response = await axios.post(
          `${BACKEND_BASE}/api/cart/add`,
          {
            productId: product.id.toString(),
            name: product.title || product.name,
            price: product.price,
            img: product.img,
            quantity: 1,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        toast.dismiss("cart-sync-shop");

        if (response.data.success) {
          toast.success("Item added to cart successfully.");
          navigate("/cart");
        }
      } catch (error) {
        toast.dismiss("cart-sync-shop");
        console.error("Cart Database Synchronization Error:", error);
        toast.error(
          error.response?.data?.message ||
            "Unable to update cart. Please try again.",
        );
      }
    } else {
      // Flow 2: Guest User (Local Browser Storage)
      let currentCart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        currentCart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(currentCart));
      toast.success("Item added to cart.");
      navigate("/cart");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Promotional Header Section */}
      <section
        className="w-full h-[40vh] flex flex-col justify-center text-center p-3.5 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('img/banner/b1.jpg')` }}
      >
        <h2 className="text-white text-4xl md:text-5xl font-bold mb-2">
          #StayHome
        </h2>
        <p className="text-white text-base md:text-lg max-w-xl mx-auto opacity-90">
          Save more with coupons & up to 70% off!
        </p>
      </section>

      {/* Catalog Grid Section */}
      <section className="px-6 sm:px-12 md:px-20 py-16 w-full max-w-360 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {ALL_PRODUCTS.map((product) => (
            <div
              key={product.id}
              onClick={() =>
                navigate("/product", { state: { product: product } })
              }
              className="group relative flex flex-col justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:border-zinc-700 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer"
            >
              {/* Product Image Wrapper */}
              <div className="w-full overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800/40 mb-3">
                <img
                  src={product.img}
                  alt={product.title || product.name}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                />
              </div>

              {/* Product Specifications */}
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  {product.brand}
                </span>

                <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1 line-clamp-2 min-h-10 group-hover:text-[#088178] dark:group-hover:text-[#0bd1c3] transition-colors">
                  {product.title || product.name}
                </h5>

                {/* Pricing & Cart Engagement */}
                <div className="flex items-center justify-between mt-4 pt-1">
                  <h4 className="text-base sm:text-lg font-extrabold text-[#088178] dark:text-[#0bd1c3]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </h4>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="p-2.5 rounded-full bg-[#e8f6ea] dark:bg-zinc-800 text-[#088178] dark:text-[#0bd1c3] border border-[#cce7d0] dark:border-zinc-700 hover:bg-[#088178] hover:text-white dark:hover:bg-[#0bd1c3] dark:hover:text-zinc-950 transition-all duration-200 shadow-sm active:scale-90 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4.25 h-4.25"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.25M16.5 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-9 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pagination Controls */}
      <section className="text-center pb-16 flex justify-center items-center gap-2">
        <span className="bg-teal-600 text-white px-4 py-2 rounded font-semibold text-sm shadow cursor-default select-none">
          1
        </span>
        <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded font-semibold text-sm hover:bg-teal-600 hover:text-white transition-colors duration-200 cursor-default select-none">
          2
        </span>
        <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded font-semibold text-sm hover:bg-teal-600 hover:text-white transition-colors duration-200 flex items-center justify-center cursor-default select-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </span>
      </section>
    </div>
  );
};

export default Shop;
