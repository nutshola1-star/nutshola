// app/admin/orders/OrdersClient.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import AdminMenu from "../../components/menu/AdminMenu";
import {
  FaBars,
  FaTimes,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaTruck,
  FaCheck,
  FaTimes as FaTimesIcon,
  FaClock,
  FaBox,
  FaPlus,
  FaSave,
  FaPrint,
  FaFilter,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../assets/logo/TransparentLogo.png";

const OrdersClient = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const { user } = useAuth();

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: "",
    shippingId: "",
    notes: "",
    customDiscount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  // Check if user has admin/editor role
  const isAdmin = user?.role === 1 || user?.role === 2;
  const isSuperAdmin = user?.role === 1;

  const perPageOptions = [5, 10, 20, 50, 100];

  //steadfast integration
  const [isGeneratingTracking, setIsGeneratingTracking] = useState(false);

  // Generate Steadfast Tracking
  const handleGenerateTracking = async () => {
    if (!editingOrder) return;
    setIsGeneratingTracking(true);

    try {
      const response = await fetch("/api/orders/steadfast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: editingOrder._id }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Order sent to Steadfast!");
        // Update the input field in the edit modal immediately
        setEditFormData((prev) => ({ ...prev, shippingId: data.trackingCode }));
        // Refresh the main orders table
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to generate tracking ID");
      }
    } catch (error) {
      console.error("Steadfast generation error:", error);
      toast.error("Failed to connect to Steadfast server");
    } finally {
      setIsGeneratingTracking(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/api/orders?page=${currentPage}&limit=${perPage}`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
        setTotalOrders(data.pagination.totalOrders);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //eslint-disable-next-line
    fetchOrders();
  }, [currentPage, perPage, statusFilter]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  // Handle search on Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      pending: FaClock,
      processing: FaSpinner,
      shipped: FaTruck,
      delivered: FaCheck,
      cancelled: FaTimesIcon,
    };
    const Icon = icons[status] || FaClock;
    return <Icon className="text-xs" />;
  };

  // Print invoice function
  const printInvoice = (order) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups for this site");
      return;
    }

    const logoUrl = Logo.src || Logo;

    // Generate invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${order.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              background: #fff;
              color: #333;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: #fff;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #559F34;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .logo-section {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            .logo-section img {
              height: auto;
              width: 200px;
              overflow: hidden;
            }
            .logo-section h1 {
              font-size: 24px;
              color: #3A393D;
            }
            .invoice-title {
              text-align: right;
            }
            .invoice-title h2 {
              font-size: 28px;
              color: #559F34;
            }
            .invoice-title p {
              color: #6b7280;
              font-size: 14px;
            }
            .order-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              padding: 15px;
              background: #f9fafb;
              border-radius: 6px;
            }
            .order-info .label {
              color: #6b7280;
              font-size: 12px;
              text-transform: uppercase;
            }
            .order-info .value {
              font-weight: 600;
              color: #3A393D;
              margin-top: 4px;
            }
            .customer-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
              padding: 15px;
              background: #f9fafb;
              border-radius: 6px;
            }
            .customer-info .label {
              color: #6b7280;
              font-size: 12px;
              text-transform: uppercase;
            }
            .customer-info .value {
              font-weight: 500;
              color: #3A393D;
              margin-top: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            thead {
              background: #559F34;
              color: white;
            }
            th {
              padding: 12px;
              text-align: left;
              font-size: 13px;
              text-transform: uppercase;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
            }
            .text-right {
              text-align: right;
            }
            .summary {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .summary-row.total {
              font-size: 20px;
              font-weight: 700;
              color: #559F34;
              border-top: 2px solid #559F34;
              padding-top: 15px;
              margin-top: 5px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
            }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-processing { background: #dbeafe; color: #1e40af; }
            .status-shipped { background: #ede9fe; color: #5b21b6; }
            .status-delivered { background: #d1fae5; color: #065f46; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
            .note-box {
              margin-top: 15px;
              padding: 12px;
              background: #fffbeb;
              border: 1px solid #fcd34d;
              border-radius: 6px;
              color: #78350f;
              font-size: 14px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
              .invoice-container { border: none; }
              .status-badge { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              thead { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="logo-section">
                <img src="${logoUrl}" alt="Nutshola" />
              </div>
              <div class="invoice-title">
                <h2>INVOICE</h2>
                <p>Order ID:${order.orderNumber}</p>
              </div>
            </div>

            <!-- Order Info -->
            <div class="order-info">
              <div>
                <div class="label">Order Date</div>
                <div class="value">${new Date(
                  order.createdAt,
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</div>
              </div>
              ${
                order.shippingId
                  ? `
              <div>
                <div class="label">Shipping ID</div>
                <div class="value">${order.shippingId}</div>
              </div>
              `
                  : ""
              }
            </div>

            <!-- Customer Info -->
            <div class="customer-info">
              <div>
                <div class="label">Customer</div>
                <div class="value">${order.customer.name}</div>
                <div style="color:#6b7280;font-size:13px;margin-top:4px;">${order.customer.phone}</div>
              </div>
              <div>
                <div class="label">Delivery Address</div>
                <div class="value">${order.customer.address}</div>
                <div style="color:#6b7280;font-size:13px;margin-top:4px;">
                  ${order.customer.thana ? order.customer.thana + ", " : ""}${order.customer.district}
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Weight</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.weight || "N/A"}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">৳${item.price.toFixed(2)}</td>
                    <td class="text-right">৳${item.total.toFixed(2)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>

            <!-- Summary -->
            <div class="summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>৳${order.subtotal.toFixed(2)}</span>
              </div>
              ${
                order.discount > 0
                  ? `
              <div class="summary-row" style="color:#059669;">
                <span>Discount</span>
                <span>- ৳${order.discount.toFixed(2)}</span>
              </div>
              `
                  : ""
              }
              <div class="summary-row">
                <span>Delivery Charge</span>
                <span>৳${order.deliveryCharge.toFixed(2)}</span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>৳${order.total.toFixed(2)}</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>Thank you for your order!</p>
              <p style="margin-top:4px;">This is a system-generated invoice. For any queries, please contact support.</p>
            </div>
          </div>
          
          <script>
            // Auto-print when loaded
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    // Write the HTML to the new window
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  // Open edit modal
  const openEditModal = (order) => {
    setEditingOrder(order);
    setEditFormData({
      status: order.status,
      shippingId: order.shippingId || "",
      notes: order.notes || "",
      customDiscount: order.discount || "",
    });
    setIsEditModalOpen(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingOrder(null);
    setEditFormData({
      status: "",
      shippingId: "",
      notes: "",
      customDiscount: "",
    });
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingOrder) return;

    setIsSubmitting(true);

    try {
      const updateData = {
        status: editFormData.status,
        shippingId: editFormData.shippingId,
        notes: editFormData.notes,
      };

      if (
        editFormData.customDiscount &&
        !isNaN(parseFloat(editFormData.customDiscount))
      ) {
        updateData.discount = parseFloat(editFormData.customDiscount);
        const subtotal = editingOrder.subtotal;
        const deliveryCharge = editingOrder.deliveryCharge || 0;
        updateData.total = subtotal - updateData.discount + deliveryCharge;
      }

      const response = await fetch(`/api/orders/${editingOrder._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Order updated successfully!");
        fetchOrders();
        closeEditModal();
      } else {
        toast.error(data.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Update order error:", error);
      toast.error("Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update status only
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch("/api/orders/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Failed to update status");
    }
  };

  // Delete order
  const handleDelete = async (orderId) => {
    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Order deleted successfully!");
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Delete order error:", error);
      toast.error("Failed to delete order");
    }
  };

  // View order details
  const viewOrder = (order) => {
    setViewingOrder(order);
    setIsViewModalOpen(true);
  };

  // Close view modal
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingOrder(null);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#559F34]"></div>
      </div>
    );
  }

  const statusOptions = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans relative md:px-10">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden transition-opacity z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left side: Sidebar */}
      <div
        className={`
        fixed top-20 bottom-0 left-0 transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:flex-shrink-0 z-50
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <AdminMenu
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileMenuOpen={setIsMobileMenuOpen}
        />
      </div>

      {/* Right side: Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="bg-white shadow-sm px-4 md:px-8 py-4 md:py-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#3A393D]">
              Orders Management
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Manage and track all customer orders
            </p>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-[#3A393D] hover:text-[#559F34] focus:outline-none p-2 rounded-md transition-colors"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </header>

        {/* Main Content Area */}
        <main className="px-2 md:px-8 pb-8 flex-1">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order #, customer, phone, or shipping ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm text-gray-600"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-[#559F34] text-white rounded-lg hover:bg-[#45802A] transition-colors text-sm"
              >
                Search
              </button>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm text-gray-600"
              >
                <option value="">All Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm text-gray-600"
              >
                {perPageOptions.map((option) => (
                  <option key={option} value={option}>
                    Show {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-[#559F34] text-4xl" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaBox className="text-4xl mx-auto mb-3 text-gray-300" />
                <p>No orders found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left py-3 px-4 font-semibold text-[#3A393D]">
                          Order #
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#3A393D]">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#3A393D]">
                          Items
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#3A393D]">
                          Total
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#3A393D]">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#3A393D]">
                          Date
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-[#3A393D]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order._id}
                          className="border-b hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-medium text-[#559F34]">
                            {order.orderNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-[#3A393D]">
                              {order.customer.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {order.customer.phone}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {order.items.length} item
                              {order.items.length > 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-[#559F34]">
                            ৳{order.total.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusBadge(order.status)}`}
                            >
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => viewOrder(order)}
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                title="View"
                              >
                                <FaEye size={16} />
                              </button>
                              {/* Print Invoice Button */}
                              <button
                                onClick={() => printInvoice(order)}
                                className="text-gray-600 hover:text-[#559F34] transition-colors"
                                title="Print Invoice"
                              >
                                <FaPrint size={16} />
                              </button>
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => openEditModal(order)}
                                    className="text-[#559F34] hover:text-[#45802A] transition-colors"
                                    title="Edit"
                                  >
                                    <FaEdit size={16} />
                                  </button>
                                  {isSuperAdmin && (
                                    <button
                                      onClick={() => handleDelete(order._id)}
                                      className="text-red-500 hover:text-red-700 transition-colors"
                                      title="Delete"
                                    >
                                      <FaTrash size={16} />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center p-4 border-t">
                    <div className="text-sm text-gray-500">
                      Showing {(currentPage - 1) * perPage + 1} to{" "}
                      {Math.min(currentPage * perPage, totalOrders)} of{" "}
                      {totalOrders} orders
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? "bg-[#559F34] text-white"
                                : "hover:bg-gray-50 border"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* View Order Modal - same as before */}
      {isViewModalOpen && viewingOrder && (
        <div className="fixed inset-0 z-[61] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={closeViewModal}
            ></div>

            <div className="relative bg-white rounded-lg w-full max-w-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#3A393D] flex items-center gap-2">
                  <FaBox className="text-[#559F34]" />
                  <span className="text-[#3A393D]">
                    Order #{viewingOrder.orderNumber}
                  </span>
                </h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Order Details */}
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${getStatusBadge(viewingOrder.status)}`}
                  >
                    {getStatusIcon(viewingOrder.status)}
                    <span className="text-inherit">
                      {viewingOrder.status.charAt(0).toUpperCase() +
                        viewingOrder.status.slice(1)}
                    </span>
                  </span>
                  {viewingOrder.shippingId && (
                    <span className="text-sm text-[#3A393D]">
                      <span className="text-gray-500">Shipping:</span>{" "}
                      <span className="text-[#3A393D] font-medium">
                        {viewingOrder.shippingId}
                      </span>
                    </span>
                  )}
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-[#3A393D] mb-1">
                      Customer
                    </h4>
                    <p className="text-sm text-[#3A393D] font-medium">
                      {viewingOrder.customer.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {viewingOrder.customer.phone}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3A393D] mb-1">
                      Delivery Address
                    </h4>
                    <p className="text-sm text-[#3A393D]">
                      {viewingOrder.customer.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      {viewingOrder.customer.thana &&
                        `${viewingOrder.customer.thana}, `}
                      {viewingOrder.customer.district}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold text-[#3A393D] mb-2">Items</h4>
                  <div className="space-y-2">
                    {viewingOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center border-b border-gray-100 pb-2"
                      >
                        <div>
                          <p className="font-medium text-sm text-[#3A393D]">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × ৳{item.price.toFixed(2)}
                            {item.weight && (
                              <span className="text-gray-400">
                                {" "}
                                ({item.weight})
                              </span>
                            )}
                          </p>
                        </div>
                        <p className="font-semibold text-sm text-[#559F34]">
                          ৳{item.total.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-[#3A393D] font-medium">
                      ৳{viewingOrder.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {viewingOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="text-green-600 font-medium">
                        - ৳{viewingOrder.discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Charge</span>
                    <span className="text-[#3A393D] font-medium">
                      ৳{viewingOrder.deliveryCharge.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span className="text-[#3A393D]">Total</span>
                    <span className="text-[#559F34] text-xl">
                      ৳{viewingOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {viewingOrder.notes && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium text-yellow-700">Note:</span>{" "}
                      {viewingOrder.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={closeViewModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-[#3A393D] rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal - same as before */}
      {isEditModalOpen && editingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={closeEditModal}
            ></div>

            <div className="relative bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#3A393D]">
                  Edit Order #{editingOrder.orderNumber}
                </h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm text-gray-600"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Shipping ID */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Shipping ID / Tracking Number
                    </label>
                    <input
                      type="text"
                      name="shippingId"
                      value={editFormData.shippingId}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm text-gray-600"
                      placeholder="Enter shipping ID"
                    />
                  </div>

                  {/* Custom Discount */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Custom Discount (৳)
                    </label>
                    <input
                      type="number"
                      name="customDiscount"
                      value={editFormData.customDiscount}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm text-gray-600"
                      placeholder="Enter discount amount"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Current discount: ৳
                      {editingOrder.discount?.toFixed(2) || "0.00"}
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={editFormData.notes}
                      onChange={handleEditChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm text-gray-600 resize-none"
                      placeholder="Add notes about this order..."
                    />
                  </div>

                  {/* Shipping ID with Steadfast Integration */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Shipping ID / Tracking Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="shippingId"
                        value={editFormData.shippingId}
                        onChange={handleEditChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm text-gray-600"
                        placeholder="Enter shipping ID"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateTracking}
                        disabled={
                          isGeneratingTracking || editFormData.shippingId
                        }
                        className="px-4 py-2 bg-[#3A393D] text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium"
                        title={
                          editFormData.shippingId
                            ? "Tracking ID already generated"
                            : "Send to Steadfast"
                        }
                      >
                        {isGeneratingTracking ? (
                          <>
                            <FaSpinner className="animate-spin" /> Sending...
                          </>
                        ) : (
                          "Load to Steadfast"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isSubmitting}
                    className="flex-1 bg-[#559F34] hover:bg-[#45802A] text-white py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <FaSave /> Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-gray-200 text-[#3A393D] rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersClient;
