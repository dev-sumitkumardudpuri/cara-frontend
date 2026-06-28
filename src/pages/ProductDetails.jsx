import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ALL_PRODUCTS as allProducts } from "../products";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const defaultProduct = allProducts[0];

  const [currentProduct, setCurrentProduct] = useState(
    location.state?.product || defaultProduct,
  );

  const [activeImg, setActiveImg] = useState(currentProduct.img);
  const [quantity, setQuantity] = useState(1);
  const [galleryProducts, setGalleryProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Environment-specific backend API base URL
  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  useEffect(() => {
    const productData = location.state?.product || defaultProduct;
    setupProductPage(productData);
  }, [location.state?.product]);

  /**
   * Initializes and structures the entire view state for the selected product.
   * Generates localized product grids and automatically snaps view to top.
   */
  const setupProductPage = (product) => {
    setCurrentProduct(product);
    setActiveImg(product.img);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const filtered = allProducts.filter((p) => p.id !== product.id);
    const shuffled = filtered.sort(() => 0.5 - Math.random());

    const pickedFeatured = shuffled.slice(0, 4);
    setFeaturedProducts(pickedFeatured);

    const galleryItems = [
      product,
      pickedFeatured[0],
      pickedFeatured[1],
      pickedFeatured[2],
    ];
    setGalleryProducts(galleryItems);
  };

  const handleGalleryClick = (selectedProduct) => {
    setCurrentProduct(selectedProduct);
    setActiveImg(selectedProduct.img);
  };

  /**
   * Dispatches product quantities to persistent state containers.
   * Synchronizes securely over HTTP headers if authenticated, otherwise pushes to standard cache.
   */
  const handleAddToCart = async (product, selectedQty) => {
    const token = localStorage.getItem("token");

    if (token) {
      // Flow 1: Authenticated User (Database Sync)
      try {
        toast.loading("Updating your cart...", { id: "cart-sync" });

        const response = await axios.post(
          `${BACKEND_BASE}/api/cart/add`,
          {
            productId: product.id.toString(),
            name: product.title || product.name,
            price: product.price,
            img: product.img,
            quantity: selectedQty,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        toast.dismiss("cart-sync");
        if (response.data.success) {
          toast.success("Cart updated successfully.");
          navigate("/cart");
        }
      } catch (error) {
        toast.dismiss("cart-sync");
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
        existingItem.quantity = (existingItem.quantity || 1) + selectedQty;
      } else {
        currentCart.push({ ...product, quantity: selectedQty });
      }

      localStorage.setItem("cart", JSON.stringify(currentCart));
      toast.success("Item added to cart.");
      navigate("/cart");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Core Specification Viewer Layout */}
      <section className="px-4 py-12 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Visual Assets Panels */}
        <div className="w-full md:w-[45%] flex flex-col gap-4">
          <div className="w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
            <img
              src={activeImg}
              alt={currentProduct.title || currentProduct.name}
              className="w-full h-auto max-h-125 object-cover transition-all duration-300"
            />
          </div>

          {/* Interactive Context Multi-Angle Previews */}
          <div className="grid grid-cols-4 gap-3">
            {galleryProducts.map((prod, idx) => (
              <div
                key={idx}
                onClick={() => handleGalleryClick(prod)}
                className={`overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-900 border-2 cursor-pointer transition-all ${
                  activeImg === prod.img
                    ? "border-teal-600 scale-95"
                    : "border-gray-200 dark:border-slate-800 hover:border-teal-500"
                }`}
              >
                <img
                  src={prod.img}
                  alt=""
                  className="w-full h-24 object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Informational Textual Metadata Block */}
        <div className="w-full md:w-[55%] flex flex-col justify-center">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Home / {currentProduct.brand}
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold mt-2 mb-4 text-gray-900 dark:text-white">
            {currentProduct.title || currentProduct.name}
          </h2>

          <h3 className="text-3xl font-black text-teal-600 dark:text-teal-400 mb-6">
            ₹{(currentProduct.price * quantity).toLocaleString("en-IN")}
          </h3>

          {/* Action Engagements: Varietal Configurations */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <select className="bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-gray-100 rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none min-w-35">
              <option>Select Size</option>
              <option>Small</option>
              <option>Large</option>
              <option>XL</option>
              <option>XXL</option>
            </select>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-16 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-800 text-center font-bold text-gray-900 dark:text-gray-100 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />

            <button
              onClick={() => handleAddToCart(currentProduct, quantity)}
              className="flex-1 md:flex-initial bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 transform active:scale-95"
            >
              Add To Cart
            </button>
          </div>

          <hr className="border-gray-200 dark:border-slate-800 my-4" />

          {/* Editorial Product Text */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Product Details
            </h4>
            <p className="text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-400">
              The Golden Ultra cotton T-shirts is made from a substantial 6.0
              oz. per sq. yd. fabric constructed from 100% cotton, this classic
              fit preshrunk jersey knit provides unmatched comfort with each
              wear. Featuring a taped neck and shoulder, and a seamless
              double-needle collar, and available in a range of colors, it
              offers it all in the ultimate head-turning package.
            </p>
          </div>
        </div>
      </section>

      {/* Cross-Sell Curated Recommendations Grid */}
      <section className="px-6 sm:px-12 md:px-20 py-16 w-full max-w-360 mx-auto border-t border-gray-100 dark:border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight mb-2">
            Featured Products
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base font-medium">
            Summer Collection New Modern Design
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setupProductPage(product)}
              className="group relative flex flex-col justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:border-zinc-700 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer"
            >
              <div className="w-full overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800/40 mb-3">
                <img
                  src={product.img}
                  alt={product.title || product.name}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                />
              </div>

              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  {product.brand}
                </span>

                <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1 line-clamp-2 min-h-10 group-hover:text-[#088178] dark:group-hover:text-[#0bd1c3] transition-colors">
                  {product.title || product.name}
                </h5>

                <div className="flex items-center justify-between mt-4 pt-1">
                  <h4 className="text-base sm:text-lg font-extrabold text-[#088178] dark:text-[#0bd1c3]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </h4>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product, 1);
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
    </div>
  );
};

export default ProductDetails;
