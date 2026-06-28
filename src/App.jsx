import { Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import FeaturedProducts from "./components/FeaturedProducts";
import Banner from "./components/Banner";
import NewArrivals from "./components/NewArrivals";
import PromoBanners from "./components/PromoBanners";
import Footer from "./components/Footer";
import About from "./pages/About";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Checkout from "./components/Checkout";
import OrderSuccess from "./components/OrderSuccess";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";

/**
 * ProductDetailsPage Component
 * Renders detailed information of a selected product using route state.
 */
function ProductDetailsPage() {
  const location = useLocation();
  const product = location.state?.product;

  // Fallback UI if no product data is passed via state
  if (!product) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-zinc-500">
        <p className="text-base font-medium">Product details unavailable.</p>
        <p className="text-sm text-zinc-400">
          Please browse and select a product from our shop.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 py-12 px-6 sm:px-12 md:px-20 text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Product Image Gallery Preview */}
        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-md">
          <img
            src={product.img}
            alt={product.title}
            className="w-full h-auto rounded-2xl object-cover"
          />
        </div>

        {/* Product Information & Purchase Controls */}
        <div className="space-y-4 text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {product.brand}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {product.title}
          </h1>
          <h2 className="text-2xl font-black text-[#088178] dark:text-[#0bd1c3]">
            {product.price}
          </h2>
          <hr className="border-zinc-100 dark:border-zinc-800" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
            This premium cotton graphic product is engineered for pure daily
            active comfort. Experience maximum fabric breathability with deep
            dynamic reactive dying.
          </p>
          <button className="w-full sm:w-auto px-8 py-3 bg-[#088178] hover:bg-[#06635c] dark:bg-[#0bd1c3] dark:hover:bg-[#09b0a4] text-white dark:text-zinc-950 font-bold rounded-xl transition-all shadow-md active:scale-95">
            Add To Bag
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Application Component
 * Handles routing and layout structures across public and admin views.
 */
function App() {
  const location = useLocation();

  // Determine layout conditions based on current path
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 flex flex-col justify-between">
      <div>
        <Navbar />
        <ScrollToTop />

        {/* Application Core Routing */}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Features />
                <FeaturedProducts />
                <Banner />
                <NewArrivals />
                <PromoBanners />
              </>
            }
          />

          <Route path="/product" element={<ProductDetails />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>

      {/* Conditionally render footer only on client-facing pages */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
