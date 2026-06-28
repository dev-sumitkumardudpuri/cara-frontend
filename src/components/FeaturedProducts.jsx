import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ALL_PRODUCTS } from "../products";

function FeaturedProducts() {
  const navigate = useNavigate();
  const [featuredList, setFeaturedList] = useState([]);

  useEffect(() => {
    // Filter array to encapsulate only targeted 'featured' categories
    const onlyFeatured = ALL_PRODUCTS.filter(
      (product) => product.category?.toLowerCase() === "featured",
    );

    const baseList = onlyFeatured.length > 0 ? onlyFeatured : ALL_PRODUCTS;

    // Fisher-Yates Shuffle Implementation
    const shuffled = [...baseList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Isolate top 8 records for runtime configuration
    setFeaturedList(shuffled.slice(0, 8));
  }, []);

  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  // Dual Action Cart Storage Controller
  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");

    if (token) {
      // Flow 1: Authenticated Cloud Synchronization
      try {
        toast.loading("Adding to your account cart...", {
          id: "cart-sync-featured",
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

        toast.dismiss("cart-sync-featured");
        if (response.data.success) {
          toast.success("Synced with your account cart!");
          navigate("/cart");
        }
      } catch (error) {
        toast.dismiss("cart-sync-featured");
        console.error("Cart Database Sync Exception:", error);
        toast.error(
          error.response?.data?.message || "Failed to update database cart.",
        );
      }
    } else {
      // Flow 2: Guest Client Storage Serialization
      let currentCart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        currentCart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(currentCart));
      toast.success("Added to guest cart!");
      navigate("/cart");
    }
  };

  return (
    <section className="w-full px-6 sm:px-12 md:px-20 py-16 bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight mb-2">
          Featured Products
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base font-medium">
          Summer Collection New Modern Design
        </p>
      </div>

      {/* Responsive Grid Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {featuredList.map((product) => (
          <div
            key={product.id}
            onClick={() =>
              navigate("/product", { state: { product: product } })
            }
            className="group relative flex flex-col justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:border-zinc-700 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer"
          >
            {/* Visual Node Asset Container */}
            <div className="w-full overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800/40 mb-3">
              <img
                src={product.img}
                alt={product.title || product.name}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
              />
            </div>

            {/* Product Meta Specification Frame */}
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                {product.brand}
              </span>

              <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1 line-clamp-2 min-h-10 group-hover:text-[#088178] dark:group-hover:text-[#0bd1c3] transition-colors">
                {product.title || product.name}
              </h5>

              {/* Pricing & Control Interface Elements */}
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
                  <ShoppingCart size={17} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;
