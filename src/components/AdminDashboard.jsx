import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosInstance from "axios";
import {
  FiPieChart,
  FiShoppingBag,
  FiUsers,
  FiMail,
  FiDollarSign,
  FiClock,
  FiActivity,
  FiCheckCircle,
  FiEye,
  FiPlusCircle,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";

import { ALL_PRODUCTS } from "../products";

const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  // Inventory Management State
  const [newProducts, setNewProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    brand: "",
    name: "",
    price: "",
    imgName: "",
    category: "normal",
  });

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchAdminData = async () => {
    try {
      const config = getAuthConfig();
      const [statsRes, ordersRes] = await Promise.all([
        axiosInstance.get(`${BACKEND_BASE}/api/admin/stats`, config),
        axiosInstance.get(`${BACKEND_BASE}/api/admin/orders`, config),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (ordersRes.data.success) {
        setAllOrders(ordersRes.data.orders || []);
      }
    } catch (error) {
      console.error("Error refreshing admin data:", error);
      toast.error("Failed to refresh data stream");
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    await fetchAdminData();
    setTimeout(() => setSyncing(false), 600);
    toast.success("Database synced live!");
  };

  const fetchAllMessages = async () => {
    try {
      const config = getAuthConfig();
      const msgRes = await axiosInstance.get(
        `${BACKEND_BASE}/api/admin/messages`,
        config,
      );
      if (msgRes.data.success) {
        setMessages(msgRes.data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || (user.role !== "admin" && user.role !== "manager")) {
      toast.error("Not authorized to access Admin Panel");
      navigate("/");
      return;
    }

    const initLoad = async () => {
      setLoading(true);
      await Promise.all([fetchAdminData(), fetchAllMessages()]);
      setLoading(false);
    };

    initLoad();
  }, [navigate]);

  const handleToggleMessageStatus = async (id) => {
    try {
      const config = getAuthConfig();
      const res = await axiosInstance.patch(
        `${BACKEND_BASE}/api/admin/messages/${id}/status`,
        {},
        config,
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setMessages((prev) =>
          prev.map((m) =>
            m._id === id ? { ...m, status: res.data.updatedMessage.status } : m,
          ),
        );
        fetchAdminData();
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error(error.response?.data?.message || "Failed to alter status");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const config = getAuthConfig();
      const res = await axiosInstance.patch(
        `${BACKEND_BASE}/api/orders/${orderId}/status`,
        { status: newStatus },
        config,
      );

      if (res.data.success) {
        toast.success(`Order status shifted to ${newStatus}!`);
        await fetchAdminData();
      }
    } catch (error) {
      console.error("Order status update error:", error);
      toast.error(error.response?.data?.message || "Failed to change status");
    }
  };

  const handleTriggerRefund = async (orderId) => {
    const loadToast = toast.loading("Connecting to Stripe Sandbox Server...");
    try {
      const config = getAuthConfig();
      const res = await axiosInstance.post(
        `${BACKEND_BASE}/api/orders/${orderId}/refund`,
        {},
        config,
      );

      toast.dismiss(loadToast);

      if (res.data.success) {
        toast.success("Funds reversed successfully via Stripe API!");
        await fetchAdminData();
      }
    } catch (error) {
      toast.dismiss(loadToast);
      console.error("Refund processing error:", error);
      toast.error(
        error.response?.data?.message || "Stripe gateway denied credit reverse",
      );
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (
      !productForm.brand ||
      !productForm.name ||
      !productForm.price ||
      !productForm.imgName
    ) {
      toast.error("Please fill all fields!");
      return;
    }
    const nextId = ALL_PRODUCTS.length + newProducts.length + 1;
    const formattedProduct = {
      id: nextId,
      brand: productForm.brand,
      name: productForm.name,
      price: Number(productForm.price),
      img: `/img/products/${productForm.imgName}`,
      category: productForm.category,
    };
    setNewProducts([...newProducts, formattedProduct]);
    toast.success(`Product #${nextId} Buffered!`);
    setProductForm({
      brand: "",
      name: "",
      price: "",
      imgName: "",
      category: "normal",
    });
  };

  const handleDownloadJSFile = () => {
    if (newProducts.length === 0) return;
    const completeProductArray = [...ALL_PRODUCTS, ...newProducts];
    const fileContent = `export const ALL_PRODUCTS = ${JSON.stringify(completeProductArray, null, 2)};`;
    const blob = new Blob([fileContent], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "products.js";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNewProducts([]);
    toast.success("Master bundle sync file ready!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0c0e10]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#088178]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0e10] text-zinc-800 dark:text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar Control Panel */}
      <div className="w-full md:w-64 bg-white dark:bg-[#16191c] border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#088178] flex items-center gap-2">
            <FiActivity /> Control Center
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-medium capitalize">
            Role:{" "}
            {JSON.parse(localStorage.getItem("user") || "{}").role || "Staff"}
          </p>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm min-w-max cursor-pointer transition-all ${
              activeTab === "overview"
                ? "bg-[#088178] text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <FiPieChart size={18} /> Master Overview
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm min-w-max cursor-pointer transition-all ${
              activeTab === "inventory"
                ? "bg-[#088178] text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <FiPlusCircle size={18} /> Inventory Add ({newProducts.length})
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm min-w-max cursor-pointer transition-all ${
              activeTab === "messages"
                ? "bg-[#088178] text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <FiMail size={18} /> Inquiries ({stats?.totalMessages || 0})
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Management Dashboard
          </h1>
          <button
            onClick={handleManualSync}
            className="p-2.5 rounded-xl bg-white dark:bg-[#16191c] border border-zinc-200 dark:border-zinc-800 hover:text-[#088178] transition-all cursor-pointer shadow-sm active:scale-95 text-zinc-600 dark:text-zinc-300"
            title="Sync Data Stream"
          >
            <FiRefreshCw
              size={16}
              className={syncing ? "animate-spin text-[#088178]" : ""}
            />
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Summary Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#16191c] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm transform transition-all duration-200 hover:scale-[1.02]">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-bold">
                    TOTAL REVENUE
                  </span>
                  <span className="text-lg sm:text-2xl font-black font-mono">
                    ₹{stats?.totalSales || 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                  <FiDollarSign size={20} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#16191c] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm transform transition-all duration-200 hover:scale-[1.02]">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-bold">
                    ORDERS LOGGED
                  </span>
                  <span className="text-lg sm:text-2xl font-black font-mono">
                    {stats?.totalOrders || 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <FiShoppingBag size={20} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#16191c] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm transform transition-all duration-200 hover:scale-[1.02]">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-bold">
                    ACTIVE CLIENTS
                  </span>
                  <span className="text-lg sm:text-2xl font-black font-mono">
                    {stats?.totalUsers || 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                  <FiUsers size={20} />
                </div>
              </div>

              <div
                onClick={() => setActiveTab("messages")}
                className="bg-white dark:bg-[#16191c] p-5 rounded-2xl border border-amber-500/30 dark:border-amber-500/20 flex items-center justify-between shadow-sm cursor-pointer hover:border-amber-500 hover:scale-[1.03] transition-all duration-300 group"
              >
                <div>
                  <span className="text-[10px] text-zinc-400 block font-bold group-hover:text-amber-500 transition-colors">
                    UNREAD QUERIES
                  </span>
                  <span className="text-lg sm:text-2xl font-black font-mono text-amber-500">
                    {stats?.totalMessages || 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <FiMail size={20} />
                </div>
              </div>
            </div>

            {/* Master Order Table Pipeline */}
            <div className="bg-white dark:bg-[#16191c] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                <FiClock /> Master Order Management Pipeline
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Client Identity</th>
                      <th className="pb-3">Net Total</th>
                      <th className="pb-3">Payment Info</th>
                      <th className="pb-3">Status Matrix</th>
                      <th className="pb-3 text-right">Pipeline Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {allOrders.map((order) => {
                      const isCOD = order.paymentMethod === "COD";
                      const isRefunded = order.status === "Refunded";
                      const isUserCancelled =
                        order.status === "Cancelled" ||
                        order.status === "Canceled" ||
                        order.status === "Pending Refund";
                      const canRefund =
                        !isCOD && isUserCancelled && !isRefunded;

                      return (
                        <tr
                          key={order._id}
                          className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="py-3 font-mono text-zinc-500">
                            #{" "}
                            {order.orderId || order._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3">
                            <span className="font-bold block">
                              {order.userId?.name || "Anonymous Client"}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {order.userId?.email || "N/A"}
                            </span>
                          </td>
                          <td className="py-3 font-bold font-mono">
                            ₹{order.totalAmount}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${isCOD ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500" : "bg-emerald-500/10 text-emerald-500"}`}
                            >
                              {order.paymentMethod || "COD"}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                                order.status === "Delivered"
                                  ? "bg-green-500/10 text-green-500"
                                  : order.status === "In Transit"
                                    ? "bg-purple-500/10 text-purple-400"
                                    : order.status === "Cancelled" ||
                                        order.status === "Canceled"
                                      ? "bg-red-500/10 text-red-500"
                                      : order.status === "Pending Refund"
                                        ? "bg-amber-500/10 text-amber-500 animate-pulse"
                                        : isRefunded
                                          ? "bg-teal-500/10 text-teal-500"
                                          : "bg-blue-500/10 text-blue-400"
                              }`}
                            >
                              {order.status || "Processing"}
                            </span>
                          </td>
                          <td className="py-3 text-right flex flex-col sm:flex-row items-center justify-end gap-2">
                            {isUserCancelled ? (
                              <span className="text-[11px] font-black text-red-500 dark:text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                                ❌ Order Cancelled
                              </span>
                            ) : (
                              <select
                                value={order.status || "Processing"}
                                disabled={
                                  order.status === "Delivered" || isRefunded
                                }
                                onChange={(e) =>
                                  handleUpdateOrderStatus(
                                    order._id,
                                    e.target.value,
                                  )
                                }
                                className={`bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5 text-[11px] font-bold outline-none cursor-pointer text-zinc-700 dark:text-zinc-300 focus:border-[#088178] max-w-35 ${
                                  order.status === "Delivered" || isRefunded
                                    ? "opacity-75 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800"
                                    : ""
                                }`}
                              >
                                {order.status === "Delivered" ? (
                                  <option value="Delivered">
                                    ✅ Delivered
                                  </option>
                                ) : isRefunded ? (
                                  <option value="Refunded">💸 Refunded</option>
                                ) : (
                                  <>
                                    <option value="Processing">
                                      ⌛ Processing
                                    </option>
                                    <option value="In Transit">
                                      📦 In Transit
                                    </option>
                                    <option value="Delivered">
                                      ✅ Delivered
                                    </option>
                                  </>
                                )}
                              </select>
                            )}

                            {canRefund && (
                              <button
                                onClick={() => handleTriggerRefund(order._id)}
                                className="bg-red-500 hover:bg-red-600 dark:bg-red-600/20 dark:hover:bg-red-600 dark:text-red-400 dark:hover:text-white border dark:border-red-500/30 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95 shadow-sm animate-pulse"
                              >
                                Execute Stripe Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {allOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-6 text-zinc-400"
                        >
                          No master pipeline orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Inventory Sync */}
        {activeTab === "inventory" && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white dark:bg-[#16191c] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-md font-black mb-4 flex items-center gap-2 text-[#088178]">
                <FiPlusCircle /> Add Product Static Engine
              </h3>
              <form
                onSubmit={handleAddProduct}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Adidas"
                    value={productForm.brand}
                    onChange={(e) =>
                      setProductForm({ ...productForm, brand: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs outline-none focus:border-[#088178]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">
                    Product Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Astronaut T-shirt"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs outline-none focus:border-[#088178]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 1299"
                    value={productForm.price}
                    onKeyDown={(e) =>
                      (e.key === "-" || e.key === "e") && e.preventDefault()
                    }
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs outline-none focus:border-[#088178]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">
                    Image File Name Only
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. f1.jpg"
                    value={productForm.imgName}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        imgName: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs outline-none focus:border-[#088178]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-zinc-400 block mb-1">
                    Select Catalog Category
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs outline-none focus:border-[#088178]"
                  >
                    <option value="featured">Featured Product</option>
                    <option value="new-arrival">New Arrival</option>
                    <option value="normal">Normal All Collection</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="md:col-span-2 bg-[#088178] text-white text-xs font-bold py-3 rounded-xl hover:bg-[#06635c] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-sm active:scale-95"
                >
                  <FiPlusCircle /> Buffer Product to List
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-[#16191c] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="font-black text-sm">
                  Product Staging Buffer Line
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  You have staged{" "}
                  <span className="text-[#088178] font-black">
                    {newProducts.length} items
                  </span>
                  . Ready to compile.
                </p>
              </div>
              <button
                onClick={handleDownloadJSFile}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <FiDownload /> Download compiled products.js
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: CRM Messages */}
        {activeTab === "messages" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`border p-5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  msg.status === "unread"
                    ? "bg-amber-50/2 border-amber-500/30 dark:border-amber-500/20 shadow-md"
                    : "bg-white dark:bg-[#16191c] border-zinc-200 dark:border-zinc-800 opacity-75"
                }`}
              >
                {msg.status === "unread" && (
                  <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-amber-500"></span>
                )}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-black text-sm flex items-center gap-2">
                      {msg.name}
                      {msg.status === "unread" && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded-md uppercase">
                          New
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-[#088178] font-mono block mb-1">
                      {msg.email}
                    </span>
                    <p className="text-[11px] font-bold text-zinc-400 mb-3">
                      Sub: {msg.subject || "No Subject"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleMessageStatus(msg._id)}
                    className={`p-2 rounded-xl border cursor-pointer active:scale-95 transition-all ${
                      msg.status === "unread"
                        ? "bg-amber-500 text-white border-amber-400 hover:bg-amber-600"
                        : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-[#088178]"
                    }`}
                  >
                    {msg.status === "unread" ? (
                      <FiEye size={15} />
                    ) : (
                      <FiCheckCircle size={15} />
                    )}
                  </button>
                </div>
                <p className="text-xs bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl italic text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800/40">
                  "{msg.message}"
                </p>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="col-span-full text-center py-12 text-zinc-400 font-medium">
                No inquiries found in stream pipeline.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
