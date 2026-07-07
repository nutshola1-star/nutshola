"use client";

import React, { useState, useEffect, useRef } from "react";
import AdminMenu from "../../components/menu/AdminMenu";
import {
  FaBars,
  FaTimes,
  FaPrint,
  FaFileInvoice,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTruck,
  FaBox,
  FaShoppingCart,
  FaMoneyBillWave,
  FaWallet,
  FaChartBar,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import MainLogo from "../../assets/logo/TransparentLogo.png";

const AccountingClient = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("accounting");
  const [accountingData, setAccountingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [printing, setPrinting] = useState(false);
  const printRef = useRef();
  const { user } = useAuth();

  // Set default dates (last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    //eslint-disable-next-line
    setEndDate(end.toISOString().split("T")[0]);
    setStartDate(start.toISOString().split("T")[0]);
  }, []);

  // Fetch accounting data
  useEffect(() => {
    if (startDate && endDate) {
      //eslint-disable-next-line
      fetchAccountingData();
    }
  }, [startDate, endDate]);

  const fetchAccountingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/accounting?startDate=${startDate}&endDate=${endDate}`,
      );
      const data = await response.json();

      if (data.success) {
        setAccountingData(data.data);
      } else {
        toast.error(data.message || "Failed to fetch accounting data");
      }
    } catch (error) {
      console.error("Error fetching accounting data:", error);
      toast.error("Failed to fetch accounting data");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (type, value) => {
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    try {
      // Fetch print data
      const response = await fetch(
        `/api/accounting/print?startDate=${startDate}&endDate=${endDate}`,
      );
      const data = await response.json();

      if (data.success) {
        // Open print window
        const printWindow = window.open("", "_blank", "width=1200,height=800");
        if (printWindow) {
          // Get the logo URL properly
          const logoUrl = MainLogo.src || MainLogo;

          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Accounting Report - Nutshola</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    color: #333;
                  }
                  .header {
                    text-align: center;
                    border-bottom: 3px solid #559F34;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                  }
                  .header .logo-container {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 10px;
                  }
                  .header .logo-container img {
                    max-height: 60px;
                    width: auto;
                  }
                  .header .logo-text {
                    font-size: 28px;
                    font-weight: bold;
                    color: #559F34;
                  }
                  .header h1 {
                    color: #3A393D;
                    margin: 0;
                    font-size: 28px;
                  }
                  .header p {
                    color: #666;
                    margin: 5px 0;
                  }
                  .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                  }
                  .summary-card {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #559F34;
                  }
                  .summary-card .label {
                    font-size: 12px;
                    color: #666;
                    text-transform: uppercase;
                  }
                  .summary-card .value {
                    font-size: 20px;
                    font-weight: bold;
                    color: #3A393D;
                    margin-top: 5px;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                  }
                  th {
                    background: #559F34;
                    color: white;
                    padding: 12px;
                    text-align: left;
                  }
                  td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #eee;
                  }
                  tr:hover {
                    background: #f5f5f5;
                  }
                  .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                  }
                  .print-button {
                    display: none;
                  }
                  @media print {
                    body { margin: 20px; }
                    .no-print { display: none; }
                    .print-button { display: none; }
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <div class="logo-container">
                    <img src="${logoUrl}" alt="Nutshola Logo" />
                  </div>
                  <h1>Accounting Report</h1>
                  <p>Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
                  <p>Generated: ${new Date().toLocaleString()}</p>
                </div>

                <div class="summary-grid">
                  <div class="summary-card">
                    <div class="label">Total Orders</div>
                    <div class="value">${data.data.summary.totalOrders}</div>
                  </div>
                  <div class="summary-card">
                    <div class="label">Total Revenue</div>
                    <div class="value">৳${data.data.summary.totalRevenue.toFixed(2)}</div>
                  </div>
                  <div class="summary-card">
                    <div class="label">Total Discount</div>
                    <div class="value">৳${data.data.summary.totalDiscount.toFixed(2)}</div>
                  </div>
                  <div class="summary-card">
                    <div class="label">Net Revenue</div>
                    <div class="value">৳${data.data.summary.netRevenue.toFixed(2)}</div>
                  </div>
                </div>

                <h2 style={{ color: '#3A393D', marginBottom: '15px' }}>Order Details</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Items</th>
                      <th>Subtotal</th>
                      <th>Discount</th>
                      <th>Delivery</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.data.orders
                      .map(
                        (order) => `
                      <tr>
                        <td>${order.orderNumber}</td>
                        <td>${order.customer?.name || "N/A"}</td>
                        <td>${order.customer?.phone || "N/A"}</td>
                        <td>${order.items?.length || 0}</td>
                        <td>৳${(order.subtotal || 0).toFixed(2)}</td>
                        <td>৳${(order.discount || 0).toFixed(2)}</td>
                        <td>৳${(order.deliveryCharge || 0).toFixed(2)}</td>
                        <td><strong>৳${(order.total || 0).toFixed(2)}</strong></td>
                        <td>${order.status || "pending"}</td>
                        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    `,
                      )
                      .join("")}
                  </tbody>
                </table>

                <div class="footer">
                  <p>© ${new Date().getFullYear()} Nutshola. All rights reserved.</p>
                  <p>This report is generated from the accounting system.</p>
                </div>

                <script>
                  window.onload = function() {
                    window.print();
                  }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      } else {
        toast.error(data.message || "Failed to fetch print data");
      }
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print report");
    } finally {
      setPrinting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#559F34]"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#559F34]"></div>
      </div>
    );
  }

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
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:flex-shrink-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Pass state handlers to the menu so it can close itself on mobile when a link is clicked */}
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
              Accounting
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Manage your Accounts.
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
          {/* Date Range Filter */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-[#559F34]" />
                <span className="font-semibold text-[#3A393D]">
                  Date Range:
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  className="px-3 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#559F34] focus:border-transparent outline-none text-sm"
                />
                <span className="text-gray-500 self-center">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  className="px-3 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#559F34] focus:border-transparent outline-none text-sm"
                />
              </div>
              <button
                onClick={handlePrint}
                disabled={printing}
                className="ml-auto bg-[#559F34] text-white px-4 py-2 rounded-lg hover:bg-[#7ECB2A] transition-colors flex items-center gap-2 text-sm"
              >
                <FaPrint />
                {printing ? "Printing..." : "Print Report"}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          {accountingData && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-[#3A393D]">
                        {accountingData.summary.totalOrders}
                      </p>
                    </div>
                    <FaShoppingCart className="text-3xl text-[#559F34] opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase">
                        Net Revenue
                      </p>
                      <p className="text-2xl font-bold text-[#3A393D]">
                        ৳{accountingData.summary.netRevenue.toFixed(2)}
                      </p>
                    </div>
                    <FaMoneyBillWave className="text-3xl text-blue-500 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase">
                        Avg Order Value
                      </p>
                      <p className="text-2xl font-bold text-[#3A393D]">
                        ৳{accountingData.summary.averageOrderValue.toFixed(2)}
                      </p>
                    </div>
                    <FaChartBar className="text-3xl text-purple-500 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase">
                        Total Discount
                      </p>
                      <p className="text-2xl font-bold text-[#3A393D]">
                        ৳{accountingData.summary.totalDiscount.toFixed(2)}
                      </p>
                    </div>
                    <FaWallet className="text-3xl text-orange-500 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#559F34] to-[#7ECB2A]">
                      <tr>
                        <th className="px-4 py-3 text-left text-white text-sm font-semibold">
                          Order #
                        </th>
                        <th className="px-4 py-3 text-left text-white text-sm font-semibold">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-white text-sm font-semibold">
                          Phone
                        </th>
                        <th className="px-4 py-3 text-left text-white text-sm font-semibold">
                          Items
                        </th>
                        <th className="px-4 py-3 text-right text-white text-sm font-semibold">
                          Subtotal
                        </th>
                        <th className="px-4 py-3 text-right text-white text-sm font-semibold">
                          Discount
                        </th>
                        <th className="px-4 py-3 text-right text-white text-sm font-semibold">
                          Delivery
                        </th>
                        <th className="px-4 py-3 text-right text-white text-sm font-semibold">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-white text-sm font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-white text-sm font-semibold">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {accountingData.orders.map((order, index) => (
                        <tr
                          key={order._id}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-4 py-3 text-sm font-medium text-[#3A393D]">
                            {order.orderNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {order.customer?.name || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {order.customer?.phone || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {order.items?.length || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">
                            ৳{(order.subtotal || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-red-500">
                            -৳{(order.discount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">
                            ৳{(order.deliveryCharge || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-[#559F34]">
                            ৳{(order.total || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold
                              ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "shipped"
                                    ? "bg-purple-100 text-purple-700"
                                    : order.status === "processing"
                                      ? "bg-blue-100 text-blue-700"
                                      : order.status === "cancelled"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {order.status || "pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer note */}
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>
                  Showing data from {new Date(startDate).toLocaleDateString()}{" "}
                  to {new Date(endDate).toLocaleDateString()}
                </p>
                <p className="mt-1">
                  Total Orders: {accountingData.summary.totalOrders} | Net
                  Revenue: ৳{accountingData.summary.netRevenue.toFixed(2)}
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AccountingClient;
