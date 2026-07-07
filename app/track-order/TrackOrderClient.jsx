// app/track-order/TrackOrderClient.jsx
"use client";

import React, { useState } from "react";
import { 
  FaSearch, 
  FaPhone, 
  FaBox, 
  FaTruck, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaChevronDown, 
  FaChevronUp, 
  FaEye, 
  FaArrowLeft 
} from "react-icons/fa";
import toast from "react-hot-toast";

const TrackOrderClient = () => {
  const [searchType, setSearchType] = useState("order"); // "order" or "phone"
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderList, setShowOrderList] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});

  // Status configuration with animations
  const statusConfig = {
    pending: {
      label: "Order Placed",
      icon: FaClock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-500",
      progress: 25,
      description: "Your order has been confirmed and is being processed",
    },
    processing: {
      label: "Processing",
      icon: FaBox,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-500",
      progress: 50,
      description: "Your order is being packed and prepared for shipment",
    },
    shipped: {
      label: "Shipped",
      icon: FaTruck,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-500",
      progress: 75,
      description: "Your order has been shipped and is on its way",
    },
    delivered: {
      label: "Delivered",
      icon: FaCheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-500",
      progress: 100,
      description: "Your order has been successfully delivered!",
    },
    cancelled: {
      label: "Cancelled",
      icon: FaTimesCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-500",
      progress: 0,
      description: "Your order has been cancelled",
    },
  };

  // Search handler using native fetch
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      toast.error("Please enter a search value", {
        duration: 3000,
        style: {
          background: "#3A393D",
          color: "#fff",
        },
      });
      return;
    }

    setLoading(true);
    setOrders([]);
    setSelectedOrder(null);
    setShowOrderList(false);

    try {
      const response = await fetch("/api/track-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchType,
          searchValue: searchValue.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (searchType === "order") {
          // Single order result
          setSelectedOrder(data.data);
          setShowOrderList(false);
          toast.success("Order found!", {
            duration: 2000,
            icon: "🎉",
            style: {
              background: "#559F34",
              color: "#fff",
            },
          });
        } else {
          // Multiple orders for phone number
          if (data.data.length > 0) {
            setOrders(data.data);
            setShowOrderList(true);
            setSelectedOrder(null);
            toast.success(`Found ${data.data.length} orders!`, {
              duration: 2000,
              icon: "📦",
              style: {
                background: "#559F34",
                color: "#fff",
              },
            });
          } else {
            toast.error("No orders found for this phone number", {
              duration: 3000,
              style: {
                background: "#3A393D",
                color: "#fff",
              },
            });
          }
        }
      } else {
        toast.error(data.message || "No order found", {
          duration: 3000,
          style: {
            background: "#3A393D",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search orders. Please try again.", {
        duration: 3000,
        style: {
          background: "#3A393D",
          color: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // View order details from list
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderList(false);
  };

  // Toggle order expansion in list
  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Go back to list
  const goBackToList = () => {
    setSelectedOrder(null);
    setShowOrderList(true);
  };

  // Render order status timeline
  const renderStatusTimeline = (status) => {
    const statuses = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = statuses.indexOf(status);
    const isCancelled = status === "cancelled";

    if (isCancelled) {
      return (
        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border-2 border-red-200 animate-pulse">
          <FaTimesCircle className="text-4xl text-red-500" />
          <div>
            <p className="text-lg font-semibold text-red-600">Order Cancelled</p>
            <p className="text-sm text-red-500">This order has been cancelled</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        {/* Mobile: Vertical timeline */}
        <div className="md:hidden space-y-4">
          {statuses.map((s, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = statusConfig[s].icon;

            return (
              <div key={s} className="flex items-start gap-4">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCompleted
                        ? "bg-green-500 text-white scale-110 shadow-lg"
                        : "bg-gray-200 text-gray-400"
                    } ${isCurrent ? "animate-bounce" : ""}`}
                  >
                    <Icon className="text-lg" />
                  </div>
                  {index < statuses.length - 1 && (
                    <div
                      className={`w-0.5 h-8 transition-all duration-700 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p
                    className={`text-sm font-semibold ${
                      isCompleted ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {statusConfig[s].label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-gray-500 mt-1">
                      {statusConfig[status]?.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: Horizontal timeline */}
        <div className="hidden md:block">
          <div className="flex justify-between items-start mb-8">
            {statuses.map((s, index) => {
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const Icon = statusConfig[s].icon;

              return (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isCompleted
                          ? "bg-green-500 text-white scale-110 shadow-lg"
                          : "bg-gray-200 text-gray-400"
                      } ${isCurrent ? "animate-bounce" : ""}`}
                    >
                      <Icon className="text-xl" />
                    </div>
                    {index < statuses.length - 1 && (
                      <div
                        className={`absolute top-6 left-full w-full h-1 transition-all duration-700 ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`}
                        style={{
                          width: "calc(100% - 1.5rem)",
                          transform: isCompleted ? "scaleX(1)" : "scaleX(0.5)",
                          transformOrigin: "left",
                        }}
                      />
                    )}
                  </div>
                  <p
                    className={`text-xs mt-2 font-semibold text-center ${
                      isCompleted ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {statusConfig[s].label}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">{statusConfig[status]?.description}</p>
          </div>
        </div>
      </div>
    );
  };

  // Render order details
  const renderOrderDetails = (order) => {
    const status = order.status || "pending";
    const statusInfo = statusConfig[status];

    return (
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-slide-up">
        {/* Header with status */}
        <div className={`p-4 md:p-6 ${statusInfo.bgColor} border-b border-gray-200`}>
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#3A393D]">
                Order #{order.orderNumber}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className={`px-3 py-1 md:px-4 md:py-2 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor} flex items-center gap-1 md:gap-2`}>
              <statusInfo.icon className={`${statusInfo.color} text-sm md:text-base`} />
              <span className={`font-semibold ${statusInfo.color} text-xs md:text-sm`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Order Info Grid */}
        <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500">Customer</p>
            <p className="font-semibold text-[#3A393D] text-sm md:text-base">{order.customer?.name}</p>
            <p className="text-xs md:text-sm text-gray-600">{order.customer?.phone}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500">Delivery Address</p>
            <p className="font-semibold text-[#3A393D] text-sm md:text-base">{order.customer?.address?.slice(0, 4) + " ***** **** ****"}</p>
            <p className="text-xs md:text-sm text-gray-600">
              {order.customer?.thana?.slice(0, 3) + "*****"}, {order.customer?.district}
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="px-4 md:px-6 pb-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 md:p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div>
                <p className="text-[10px] md:text-xs text-gray-500">Subtotal</p>
                <p className="font-bold text-[#3A393D] text-sm md:text-base">৳{order.subtotal?.toFixed(2)}</p>
              </div>
              {order.discount > 0 && (
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500">Discount</p>
                  <p className="font-bold text-red-500 text-sm md:text-base">-৳{order.discount.toFixed(2)}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] md:text-xs text-gray-500">Delivery</p>
                <p className="font-bold text-[#3A393D] text-sm md:text-base">৳{order.deliveryCharge?.toFixed(2) || "0.00"}</p>
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-gray-500">Total</p>
                <p className="font-bold text-[#559F34] text-base md:text-lg">৳{order.total?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="px-4 md:px-6 pb-6">
          <h3 className="text-base md:text-lg font-semibold text-[#3A393D] mb-4">Order Status</h3>
          {renderStatusTimeline(status)}
        </div>

        {/* Back button */}
        {searchType === "phone" && (
          <div className="px-4 md:px-6 pb-6">
            <button
              onClick={goBackToList}
              className="flex items-center gap-2 text-[#559F34] hover:text-[#7ECB2A] transition-colors text-sm md:text-base"
            >
              <FaArrowLeft />
              Back to all orders
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render order list
  const renderOrderList = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h3 className="text-lg md:text-xl font-bold text-[#3A393D]">
            {orders.length} Order{orders.length > 1 ? "s" : ""} Found
          </h3>
          <button
            onClick={() => {
              setOrders([]);
              setShowOrderList(false);
              setSearchValue("");
            }}
            className="text-xs md:text-sm text-gray-500 hover:text-[#559F34]"
          >
            Clear Search
          </button>
        </div>

        {orders.map((order) => {
          const status = order.status || "pending";
          const statusInfo = statusConfig[status];
          const isExpanded = expandedOrders[order._id];

          return (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div
                className="p-3 md:p-4 cursor-pointer"
                onClick={() => toggleOrderExpand(order._id)}
              >
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${statusInfo.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <statusInfo.icon className={`${statusInfo.color} text-sm md:text-base`} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#3A393D] text-sm md:text-base">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4">
                    <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <p className="font-bold text-[#559F34] text-sm md:text-base">৳{order.total?.toFixed(2)}</p>
                    {isExpanded ? <FaChevronUp className="text-gray-400 text-sm md:text-base" /> : <FaChevronDown className="text-gray-400 text-sm md:text-base" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 animate-slide-down">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                      <div>
                        <p className="text-gray-500">Customer</p>
                        <p className="font-medium text-[#3A393D]">{order.customer?.name}</p>
                        <p className="text-gray-600">{order.customer?.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Address</p>
                        <p className="font-medium text-[#3A393D]">{order.customer?.address?.slice(0, 4) + " ***** **** ****"}</p>
                        <p className="text-gray-600">
                          {order.customer?.thana?.slice(0, 3) + " ****"}, {order.customer?.district}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Items</p>
                        <p className="font-medium text-[#3A393D]">{order.items?.length || 0} products</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Payment</p>
                        <p className="font-medium text-[#3A393D] capitalize">{order.paymentMethod}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewOrderDetails(order);
                      }}
                      className="mt-3 w-full bg-[#559F34] text-white py-2 rounded-lg hover:bg-[#7ECB2A] transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <FaEye />
                      View Full Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-6 px-3 md:py-12 md:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-[#3A393D] mb-2 md:mb-3">
            Track Your Order
          </h1>
          <p className="text-gray-600 text-xs md:text-base">
            Enter your order number or phone number to track your order status
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 mb-6 md:mb-8 border border-gray-100">
          {/* Mobile: Stack buttons vertically */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-4">
            <button
              onClick={() => {
                setSearchType("order");
                setOrders([]);
                setSelectedOrder(null);
                setShowOrderList(false);
              }}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold transition-all text-sm md:text-base ${
                searchType === "order"
                  ? "bg-[#559F34] text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FaBox className="inline mr-2" />
              Order Number
            </button>
            <button
              onClick={() => {
                setSearchType("phone");
                setOrders([]);
                setSelectedOrder(null);
                setShowOrderList(false);
              }}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold transition-all text-sm md:text-base ${
                searchType === "phone"
                  ? "bg-[#559F34] text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FaPhone className="inline mr-2" />
              Phone Number
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                searchType === "order"
                  ? "Enter your order number (e.g., ABC12)"
                  : "Enter your phone number (e.g., 017xxxxxxxx)"
              }
              className="flex-1 text-gray-600 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#559F34] focus:border-transparent outline-none transition-all text-sm md:text-base"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 md:px-8 py-3 bg-gradient-to-r from-[#559F34] to-[#7ECB2A] text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <FaSearch />
              )}
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>

          <div className="mt-3 text-[10px] md:text-xs text-gray-500">
            <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">🔍</span>
            {searchType === "order" ? (
              "Search by your unique 5-character order number"
            ) : (
              "Search by the phone number used when placing the order"
            )}
          </div>
        </div>

        {/* Results */}
        {selectedOrder && (
          <div className="animate-fade-in">
            {renderOrderDetails(selectedOrder)}
          </div>
        )}

        {showOrderList && orders.length > 0 && (
          <div className="animate-fade-in">
            {renderOrderList()}
          </div>
        )}

        {/* No results - show helpful tips */}
        {!selectedOrder && !showOrderList && !loading && searchValue && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 md:p-6 text-center animate-pulse-slow">
            <FaBox className="text-4xl text-yellow-500 mx-auto mb-3" />
            <h3 className="text-base md:text-lg font-semibold text-[#3A393D]">No orders found</h3>
            <p className="text-gray-600 mt-2 text-xs md:text-sm">
              Please check your {searchType === "order" ? "order number" : "phone number"} and try again.
              {searchType === "phone" && (
                <span className="block mt-1">
                  Make sure you're using the same phone number you provided when placing the order.
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderClient;