import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Standard Axios Instance setup
const axiosInstance = axios.create({
  baseURL: BACKEND_BASE,
});

import {
  FiUser,
  FiShoppingBag,
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiXCircle,
  FiRefreshCw,
  FiMapPin,
  FiEdit2,
} from "react-icons/fi";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Profile fields state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "Male",
  });

  // Address Fields State Management
  const [addressData, setAddressData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  // View/Edit toggle mode control state for Address tab
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [userRes, ordersRes] = await Promise.all([
          axiosInstance.get("/api/auth/profile", config),
          axiosInstance.get("/api/orders/myorders", config),
        ]);

        const userData = userRes.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        setFormData({
          name: userData.name || "",
          phone: userData.phone || "",
          gender: userData.gender || "Male",
        });

        // Pre-populate sub-document address registry mapping loop
        if (userData.savedAddress) {
          setAddressData({
            name: userData.savedAddress.name || "",
            phone: userData.savedAddress.phone || "",
            address: userData.savedAddress.address || "",
            city: userData.savedAddress.city || "",
            pincode: userData.savedAddress.pincode || "",
          });
        }

        if (Array.isArray(ordersRes.data)) {
          setOrders(ordersRes.data);
        } else if (ordersRes.data && Array.isArray(ordersRes.data.orders)) {
          setOrders(ordersRes.data.orders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        const errMsg =
          error.response?.data?.message || "Failed to load dashboard data";
        toast.error(errMsg);

        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/");
    };

    const handleStorageChange = () => {
      if (!localStorage.getItem("token")) {
        toast.success("Session expired/Logged out");
        handleLogout();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axiosInstance.put(
        "/api/auth/profile",
        formData,
        config,
      );
      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  // Saved Address Update Submission Network Request Handler
  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Strict Real-life validations before pushing payload to API pipeline
    if (
      !addressData.name.trim() ||
      !addressData.phone.trim() ||
      !addressData.address.trim() ||
      !addressData.city.trim() ||
      !addressData.pincode.trim()
    ) {
      toast.error("Please fill out all address fields correctly!");
      return;
    }

    if (addressData.phone.length < 10) {
      toast.error("Mobile number must be exactly 10 digits!");
      return;
    }

    if (addressData.pincode.length < 6) {
      toast.error("Pincode must be exactly 6 digits!");
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axiosInstance.put(
        "/api/auth/address",
        addressData,
        config,
      );

      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Shipping address saved successfully!");
      setIsEditingAddress(false);
    } catch (error) {
      console.error("Address update database save error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update logistical address mapping",
      );
    }
  };

  // Real-life sanitization input change listeners for address keys
  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" || name === "city") {
      setAddressData((prev) => ({
        ...prev,
        [name]: value.replace(/[^a-zA-Z\s]/g, ""),
      }));
    } else if (name === "phone") {
      setAddressData((prev) => ({
        ...prev,
        [name]: value.replace(/\D/g, "").slice(0, 10),
      }));
    } else if (name === "pincode") {
      setAddressData((prev) => ({
        ...prev,
        [name]: value.replace(/\D/g, "").slice(0, 6),
      }));
    } else {
      setAddressData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axiosInstance.put(
        `/api/orders/${orderId}/cancel`,
        {},
        config,
      );
      const data = res.data;

      toast.success(data.message || "Order Status Updated!");
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: data.updatedStatus || "Cancelled" }
            : order,
        ),
      );
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0c0e10]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#088178]"></div>
      </div>
    );
  }

  const ordersList = Array.isArray(orders) ? orders : [];
  const activeOrders = ordersList.filter((o) =>
    ["Processing", "In Transit"].includes(o.status || "Processing"),
  );
  const completedOrders = ordersList.filter((o) =>
    ["Delivered", "Cancelled", "Refunded"].includes(o.status),
  );
  const returnCancelOrders = ordersList.filter((o) =>
    ["Cancelled", "Pending Refund", "Refunded"].includes(o.status),
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-[#0c0e10] text-zinc-800 dark:text-zinc-100 py-4 md:py-12 px-2 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 lg:gap-8 pb-12 md:pb-0">
        {/* SIDEBAR */}
        <div className="w-full md:w-1/4 space-y-3 hidden md:block">
          <div className="bg-white dark:bg-[#16191c] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xs text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <div className="w-full h-full bg-[#088178]/10 text-[#088178] rounded-full flex items-center justify-center border border-[#088178]/20 font-black text-3xl shadow-inner uppercase">
                {user?.name ? user.name.trim().charAt(0) : "?"}
              </div>
            </div>
            <h2 className="text-base font-bold tracking-tight truncate text-zinc-800 dark:text-zinc-200">
              {user?.name || "User"}
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
              {user?.email || "No Email"}
            </p>
          </div>

          <div className="bg-white dark:bg-[#16191c] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-2 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm cursor-pointer transform transition-all duration-300 ease-in-out ${
                activeTab === "profile"
                  ? "bg-[#088178] text-white shadow-md shadow-[#088178]/20 scale-[1.02]"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:translate-x-1"
              }`}
            >
              <FiUser
                size={18}
                className={`transition-transform duration-300 ${activeTab === "profile" ? "scale-110" : ""}`}
              />
              My Account
            </button>

            <button
              onClick={() => setActiveTab("address")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm cursor-pointer transform transition-all duration-300 ease-in-out ${
                activeTab === "address"
                  ? "bg-[#088178] text-white shadow-md shadow-[#088178]/20 scale-[1.02]"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:translate-x-1"
              }`}
            >
              <FiMapPin
                size={18}
                className={`transition-transform duration-300 ${activeTab === "address" ? "scale-110" : ""}`}
              />
              Saved Address
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm cursor-pointer transform transition-all duration-300 ease-in-out ${
                activeTab === "orders"
                  ? "bg-[#088178] text-white shadow-md shadow-[#088178]/20 scale-[1.02]"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:translate-x-1"
              }`}
            >
              <FiShoppingBag
                size={18}
                className={`transition-transform duration-300 ${activeTab === "orders" ? "scale-110" : ""}`}
              />
              My Orders
            </button>

            <button
              onClick={() => setActiveTab("returns")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm cursor-pointer transform transition-all duration-300 ease-in-out ${
                activeTab === "returns"
                  ? "bg-[#088178] text-white shadow-md shadow-[#088178]/20 scale-[1.02]"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:translate-x-1"
              }`}
            >
              <FiXCircle
                size={18}
                className={`transition-transform duration-300 ${activeTab === "returns" ? "scale-110" : ""}`}
              />
              <span>Cancelled Orders</span>
            </button>
          </div>
        </div>
        {/* MOBILE NAVIGATION */}
        <div className="block md:hidden w-full overflow-x-auto no-scrollbar mb-2 px-1">
          <div className="flex space-x-2 min-w-max bg-zinc-200/60 dark:bg-zinc-800/40 p-1.5 rounded-2xl border border-zinc-300/30 dark:border-zinc-800/50">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide ${
                activeTab === "profile"
                  ? "bg-[#088178] text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <FiUser size={15} /> My Account
            </button>
            <button
              onClick={() => setActiveTab("address")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide ${
                activeTab === "address"
                  ? "bg-[#088178] text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <FiMapPin size={15} /> Address
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide ${
                activeTab === "orders"
                  ? "bg-[#088178] text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <FiShoppingBag size={15} /> My Orders
            </button>
            <button
              onClick={() => setActiveTab("returns")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide ${
                activeTab === "returns"
                  ? "bg-[#088178] text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <FiXCircle size={15} /> Cancelled Orders
            </button>
          </div>
        </div>

        {/* DISPLAY PANEL */}
        <div className="flex-1 bg-white dark:bg-[#16191c] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-8 shadow-xs">
          <div className="mb-6 p-4 sm:p-6 bg-linear-to-r from-[#088178]/10 via-[#088178]/5 to-transparent rounded-2xl border border-[#088178]/10">
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Hey,{" "}
              <span className="text-[#088178] capitalize">
                {user?.name ? user.name.split(" ")[0] : "User"}
              </span>
              !
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Welcome back to your account. Check your live orders and update
              your preferences below.
            </p>
          </div>

          {/* TAB 1: PROFILE MANAGEMENT */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  <FiUser size={18} className="text-[#088178]" /> Personal
                  Configurations
                </h3>
              </div>

              <form
                onSubmit={handleProfileUpdate}
                className="space-y-4 max-w-xl"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-[11px] font-bold uppercase text-zinc-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-[#088178] font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-[11px] font-bold uppercase text-zinc-400">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-[#088178] font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-zinc-400">
                    Email (Secure lock)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-2.5 text-sm bg-zinc-100 dark:bg-zinc-800/10 text-zinc-400 border border-zinc-200 dark:border-zinc-800/60 rounded-xl cursor-not-allowed font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#088178] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#066c64] cursor-pointer"
                >
                  Update Profile
                </button>
              </form>
            </div>
          )}

          {/* SAVED SHIPPING ADDRESS SUB-DOCUMENT INTERFACE */}
          {activeTab === "address" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    <FiMapPin size={18} className="text-[#088178]" /> Saved
                    Logistics Destination
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Save your address here to experience rapid one-click
                    automated checkout pipelines.
                  </p>
                </div>
                {/* Professional Toggle Mode Control Button */}
                {!isEditingAddress && (
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-[#088178] dark:hover:bg-[#088178] hover:text-white text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700/60 hover:border-transparent"
                  >
                    <FiEdit2 size={13} /> Edit Address
                  </button>
                )}
              </div>

              <form
                onSubmit={handleAddressUpdate}
                className="space-y-4 max-w-xl"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">
                      Consignee Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={addressData.name}
                      onChange={handleAddressInputChange}
                      readOnly={!isEditingAddress}
                      placeholder="Receiver's Name"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none font-medium ${
                        !isEditingAddress
                          ? "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
                          : "bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700 focus:border-[#088178]"
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">
                      Secure Phone Line
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={addressData.phone}
                      onChange={handleAddressInputChange}
                      readOnly={!isEditingAddress}
                      placeholder="Contact Number (10 digits)"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none font-medium ${
                        !isEditingAddress
                          ? "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
                          : "bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700 focus:border-[#088178]"
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">
                    Street Address Map Location
                  </label>
                  <textarea
                    name="address"
                    rows="3"
                    value={addressData.address}
                    onChange={handleAddressInputChange}
                    readOnly={!isEditingAddress}
                    placeholder="Flat/House No, Building, Colony, Street name..."
                    className={`w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none font-medium resize-none ${
                      !isEditingAddress
                        ? "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
                        : "bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700 focus:border-[#088178]"
                    }`}
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={addressData.city}
                      onChange={handleAddressInputChange}
                      readOnly={!isEditingAddress}
                      placeholder="City Name"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none font-medium ${
                        !isEditingAddress
                          ? "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
                          : "bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700 focus:border-[#088178]"
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">
                      Postal Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={addressData.pincode}
                      onChange={handleAddressInputChange}
                      readOnly={!isEditingAddress}
                      placeholder="6-Digit Code"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none font-medium ${
                        !isEditingAddress
                          ? "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
                          : "bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700 focus:border-[#088178]"
                      }`}
                      required
                    />
                  </div>
                </div>

                {isEditingAddress && (
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#088178] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#066c64] cursor-pointer"
                    >
                      Save Delivery Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm sm:text-base font-black tracking-tight text-[#088178] flex items-center gap-2 mb-4">
                  <FiTruck /> Active Pipelines
                </h3>
                <div className="space-y-4">
                  {activeOrders.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">
                      No running shipments found.
                    </p>
                  ) : (
                    activeOrders.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        handleCancelOrder={handleCancelOrder}
                      />
                    ))
                  )}
                </div>
              </div>

              <hr className="border-zinc-200 dark:border-zinc-800" />

              <div>
                <h3 className="text-sm sm:text-base font-black tracking-tight text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mb-4">
                  <FiCheckCircle /> History Logs
                </h3>
                <div className="space-y-4">
                  {completedOrders.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">
                      History clean.
                    </p>
                  ) : (
                    completedOrders.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        handleCancelOrder={handleCancelOrder}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RETURN & CANCEL */}
          {activeTab === "returns" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 text-red-500">
                  <FiXCircle size={18} /> Financial & Reverse Logs
                </h3>
              </div>

              <div className="space-y-4">
                {returnCancelOrders.length === 0 ? (
                  <p className="text-xs sm:text-sm text-zinc-400 italic text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    No active reverse transitions.
                  </p>
                ) : (
                  returnCancelOrders.map((order) => (
                    <div
                      key={order._id}
                      className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4 bg-zinc-50/50 dark:bg-transparent"
                    >
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-between items-center gap-3 text-xs mb-4">
                        <div>
                          <span className="text-zinc-400 block font-bold text-[10px]">
                            ORDER ID
                          </span>
                          <span className="font-mono font-bold break-all sm:break-normal">
                            {order.orderId || order._id}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block font-bold text-[10px]">
                            METHOD
                          </span>
                          <span className="font-bold text-zinc-600 dark:text-zinc-400">
                            {order.paymentMethod}
                          </span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-zinc-400 block font-bold text-[10px]">
                            REVERSE TRANSIT
                          </span>
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Render product item details inside Cancelled logs section */}
                      {order.items && order.items.length > 0 && (
                        <div className="mb-4 space-y-2 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-3">
                          {order.items.map((item, idx) => (
                            <div
                              key={item.product?._id || idx}
                              className="flex items-center gap-3"
                            >
                              <img
                                src={
                                  item.product?.image ||
                                  item.product?.img ||
                                  item.image ||
                                  item.img ||
                                  "https://via.placeholder.com/50"
                                }
                                alt={item.product?.name || "Product"}
                                className="w-10 h-10 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/50";
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold truncate text-zinc-700 dark:text-zinc-300">
                                  {item.product?.name ||
                                    item.name ||
                                    "Ordered Product"}
                                </p>
                                <p className="text-[10px] text-zinc-400 font-medium">
                                  Qty: {item.quantity || item.qty || 1} • ₹
                                  {item.price || 0}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="py-2 px-3 rounded-lg border dark:border-zinc-800 text-[11px] font-bold bg-zinc-50 dark:bg-zinc-900/50">
                        {order.status === "Cancelled" && (
                          <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <FiXCircle /> Terminated (No Charge Processed)
                          </span>
                        )}
                        {order.status === "Pending Refund" && (
                          <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <FiRefreshCw className="animate-spin" /> Gateway
                            Settlement In-Flight
                          </span>
                        )}
                        {order.status === "Refunded" && (
                          <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <FiCheckCircle /> Refunded to Original Method via
                            Stripe
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- ORDER CARD SUBCOMPONENT ---
function OrderCard({ order, handleCancelOrder }) {
  // DELIVERY DATE CALCULATION LOGIC
  // const getDeliveryStatusText = () => {
  //   if (!order.createdAt) return null;

  //   const orderDate = new Date(order.createdAt);

  //   if (order.status === "Delivered") {
  //     const deliveryDate = order.updatedAt
  //       ? new Date(order.updatedAt)
  //       : new Date();
  //     return (
  //       <span className="text-green-600 dark:text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-md">
  //         Delivered on:{" "}
  //         {deliveryDate.toLocaleDateString("en-IN", {
  //           day: "numeric",
  //           month: "short",
  //           year: "numeric",
  //         })}
  //       </span>
  //     );
  //   }

  //   const minDeliveryDate = new Date(orderDate);
  //   minDeliveryDate.setDate(orderDate.getDate() + 5);

  //   const maxDeliveryDate = new Date(orderDate);
  //   maxDeliveryDate.setDate(orderDate.getDate() + 7);

  //   const options = { day: "numeric", month: "short" };
  //   const minStr = minDeliveryDate.toLocaleDateString("en-IN", options);
  //   const maxStr = maxDeliveryDate.toLocaleDateString("en-IN", options);

  //   return (
  //     <span className="text-[#088178] font-bold bg-[#088178]/10 px-2 py-0.5 rounded-md">
  //       Arriving between: {minStr} - {maxStr}
  //     </span>
  //   );
  // };

  // DELIVERY, CANCEL, AND REFUND STATUS TEXT LOGIC
  const getDeliveryStatusText = () => {
    if (!order.createdAt) return null;

    const orderDate = new Date(order.createdAt);
    const updateDate = order.updatedAt ? new Date(order.updatedAt) : new Date();
    const formattedUpdateDate = updateDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Handle Delivered Status
    if (order.status === "Delivered") {
      return (
        <span className="text-green-600 dark:text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-md">
          Delivered on: {formattedUpdateDate}
        </span>
      );
    }

    // Handle Cancelled Status
    if (order.status === "Cancelled") {
      return (
        <span className="text-red-600 dark:text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-md">
          Cancelled on: {formattedUpdateDate}
        </span>
      );
    }

    // Handle Refunded / Pending Refund Status
    if (order.status === "Refunded" || order.status === "Pending Refund") {
      return (
        <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
          Refunded on: {formattedUpdateDate}
        </span>
      );
    }

    // Default Arriving Prediction for Active Orders
    const minDeliveryDate = new Date(orderDate);
    minDeliveryDate.setDate(orderDate.getDate() + 5);

    const maxDeliveryDate = new Date(orderDate);
    maxDeliveryDate.setDate(orderDate.getDate() + 7);

    const options = { day: "numeric", month: "short" };
    const minStr = minDeliveryDate.toLocaleDateString("en-IN", options);
    const maxStr = maxDeliveryDate.toLocaleDateString("en-IN", options);

    return (
      <span className="text-[#088178] font-bold bg-[#088178]/10 px-2 py-0.5 rounded-md">
        Arriving between: {minStr} - {maxStr}
      </span>
    );
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-transparent">
      <div className="bg-zinc-50 dark:bg-zinc-800/20 px-3 sm:px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-xs">
        <div className="grid grid-cols-2 sm:flex gap-4 sm:gap-6">
          <div>
            <span className="text-zinc-400 block font-bold text-[10px]">
              ORDER ID
            </span>
            <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300 break-all sm:break-normal">
              {order.orderId || order._id}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block font-bold text-[10px]">
              METHOD
            </span>
            <span className="font-bold text-zinc-600 dark:text-zinc-400">
              {order.paymentMethod}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-zinc-400 block font-bold text-[10px]">
              NET PAYABLE
            </span>
            <span className="font-bold font-mono text-zinc-900 dark:text-white">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>

        <div className="w-full sm:w-auto flex justify-end">
          {(order.status === "Processing" || !order.status) && (
            <button
              onClick={() => handleCancelOrder(order._id)}
              className="w-full sm:w-auto text-center px-4 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg font-bold text-[11px] cursor-pointer transition-all"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* --- Safe Injection Point: Product Thumbnail Mapping Loop --- */}
      {order.items && order.items.length > 0 && (
        <div className="px-3 sm:px-5 pt-4 pb-2 border-b border-zinc-100 dark:border-zinc-800/40 space-y-3 bg-black-50/20">
          {order.items.map((item, index) => (
            <div
              key={item.product?._id || index}
              className="flex items-center gap-4"
            >
              {/* Product Image Thumbnail with fallback handler */}
              <img
                src={
                  item.product?.image ||
                  item.product?.img ||
                  item.image ||
                  item.img ||
                  "https://via.placeholder.com/60"
                }
                alt={item.product?.name || "Product"}
                className="w-12 h-12 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white shadow-xs"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/60";
                }}
              />
              {/* Product Meta Specifications Container */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black truncate text-zinc-800 dark:text-zinc-200">
                  {item.product?.name || item.name || "Ordered Item"}
                </h4>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">
                  Quantity: {item.quantity || item.qty || 1}{" "}
                  <span className="mx-1.5">•</span> Price: ₹{item.price || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STATUS AND STEPPER SECTION */}
      <div className="px-3 sm:px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/40">
        <div className="mb-4 flex flex-wrap items-center justify-between text-[11px] gap-2 border-b border-zinc-100 dark:border-zinc-800/40 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-bold uppercase text-[10px]">
              Status Update:
            </span>
            {getDeliveryStatusText()}
          </div>

          {order.createdAt && (
            <div className="text-zinc-400 font-medium">
              Ordered on:{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
            Live tracking:
          </span>
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              ["Cancelled", "Refunded"].includes(order.status)
                ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                : order.status === "Delivered"
                  ? "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
                  : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
            }`}
          >
            {order.status || "Processing"}
          </span>
        </div>

        {/* TRACKING STEPPER LINE - Only renders if order is not cancelled or refunded */}
        {!["Cancelled", "Pending Refund", "Refunded"].includes(
          order.status,
        ) && (
          <div className="relative w-full flex justify-between mt-5 px-1">
            <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 z-0">
              <div
                className="h-full bg-[#088178] transition-all duration-300"
                style={{
                  width:
                    order.status === "Delivered"
                      ? "100%"
                      : order.status === "In Transit"
                        ? "50%"
                        : "0%",
                }}
              ></div>
            </div>

            <div className="relative z-10 flex flex-col items-center bg-white dark:bg-[#16191c] px-1">
              <div className="w-5 h-5 rounded-full bg-[#088178] text-white flex items-center justify-center text-[9px]">
                <FiPackage />
              </div>
              <span className="text-[9px] font-bold mt-1">Confirmed</span>
            </div>
            <div className="relative z-10 flex flex-col items-center bg-white dark:bg-[#16191c] px-1">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                  ["In Transit", "Delivered"].includes(order.status)
                    ? "bg-[#088178] text-white"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                }`}
              >
                <FiTruck />
              </div>
              <span className="text-[9px] font-bold mt-1">Shipped</span>
            </div>
            <div className="relative z-10 flex flex-col items-center bg-white dark:bg-[#16191c] px-1">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                  order.status === "Delivered"
                    ? "bg-[#088178] text-white"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                }`}
              >
                <FiCheckCircle />
              </div>
              <span className="text-[9px] font-bold mt-1">Delivered</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
