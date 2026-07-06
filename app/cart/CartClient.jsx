// app/cart/CartClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaArrowLeft,
  FaLock,
  FaTruck,
  FaShieldAlt,
  FaCreditCard,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaHome,
  FaTag,
  FaTimes,
  FaGift,
  FaSpinner,
} from "react-icons/fa";
import toast from "react-hot-toast";

// Import from all-bangladeshi-addresses
import { allDistrictEN, thanasENOf } from "all-bangladeshi-addresses";

// Define Dhaka district (case insensitive)
const DHAKA_DISTRICTS = ["dhaka", "ঢাকা"];

const CartClient = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getTotalWeight,
  } = useCart();

  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliveryChargeLoading, setDeliveryChargeLoading] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Customer information state
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    thana: "",
    district: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Get districts and thanas
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(true);

  // Load districts on mount
  useEffect(() => {
    //eslint-disable-next-line
    setIsMounted(true);

    try {
      const districtList = allDistrictEN();
      setDistricts(districtList);
    } catch (error) {
      console.error("Error loading districts:", error);
      toast.error("Failed to load districts");
    } finally {
      setDistrictsLoading(false);
    }
  }, []);

  // Update thanas when district changes
  useEffect(() => {
    if (customerInfo.district) {
      try {
        const thanaList = thanasENOf(customerInfo.district);
        //eslint-disable-next-line
        setThanas(thanaList || []);
        if (customerInfo.thana) {
          setCustomerInfo((prev) => ({ ...prev, thana: "" }));
        }
      } catch (error) {
        console.error("Error loading thanas:", error);
        setThanas([]);
        toast.error("Failed to load thanas");
      }
    } else {
      setThanas([]);
    }
  }, [customerInfo.district]);

  // Calculate total weight from context
  const totalWeight = getTotalWeight();

  // Calculate delivery charge when district or cart items change
  useEffect(() => {
    //eslint-disable-next-line
    calculateDeliveryCharge();
  }, [customerInfo.district, cartItems]);

  // Fetch available coupons when cart total changes
  useEffect(() => {
    if (cartItems.length > 0) {
      //eslint-disable-next-line
      fetchAvailableCoupons();
    } else {
      //eslint-disable-next-line
      setAvailableCoupons([]);
    }
  }, [cartItems, getCartTotal()]);

  // Calculate delivery charge based on weight and location
  const calculateDeliveryCharge = async () => {
    if (cartItems.length === 0) {
      setDeliveryCharge(0);
      return;
    }

    if (!customerInfo.district) {
      setDeliveryCharge(0);
      return;
    }

    setDeliveryChargeLoading(true);

    try {
      const isInsideDhaka = DHAKA_DISTRICTS.includes(
        customerInfo.district.toLowerCase(),
      );

      const response = await fetch("/api/courier-charges/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight: totalWeight,
          isInsideDhaka,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDeliveryCharge(data.charge || 0);
      } else {
        setDeliveryCharge(0);
        console.warn("Delivery charge calculation:", data.message);
      }
    } catch (error) {
      console.error("Error calculating delivery charge:", error);
      setDeliveryCharge(0);
    } finally {
      setDeliveryChargeLoading(false);
    }
  };

  // Fetch available coupons
  const fetchAvailableCoupons = async () => {
    try {
      const cartTotal = getCartTotal();
      const response = await fetch(`/api/coupons?isActive=true`);
      const data = await response.json();

      if (data.success) {
        // Filter coupons that are applicable to the current cart
        const applicable = data.coupons.filter((coupon) => {
          return cartTotal >= coupon.minPurchase;
        });
        setAvailableCoupons(applicable.slice(0, 3)); // Show max 3 suggestions
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  // Apply coupon
  const applyCoupon = async (code) => {
    setCouponLoading(true);
    setCouponError("");

    try {
      const cartTotal = getCartTotal();

      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          amount: cartTotal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.coupon.discount);
        setCouponCode("");
        toast.success(`Coupon applied! You saved ৳${data.coupon.discount}`);
        setShowCouponInput(false);
      } else {
        setCouponError(data.message || "Invalid coupon code");
        toast.error(data.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Apply coupon error:", error);
      setCouponError("Failed to apply coupon");
      toast.error("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    toast.success("Coupon removed");
  };

  // Apply suggested coupon
  const applySuggestedCoupon = (coupon) => {
    applyCoupon(coupon.code);
  };

  const handleInputChange = (field, value) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, customerInfo[field]);
  };

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "name":
        if (!value || value.trim().length < 2) {
          error = "Please enter your full name (minimum 2 characters)";
        }
        break;
      case "phone":
        const phoneRegex = /^[0-9]{11}$/;
        if (!value) {
          error = "Phone number is required";
        } else if (!phoneRegex.test(value)) {
          error = "Phone number must be exactly 11 digits";
        }
        break;
      case "address":
        if (!value || value.trim().length < 5) {
          error = "Please enter your full address (minimum 5 characters)";
        }
        break;
      case "thana":
        if (!value) {
          error = "Please select a thana/police station";
        }
        break;
      case "district":
        if (!value) {
          error = "Please select a district";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const validateForm = () => {
    const fields = ["name", "phone", "address", "thana", "district"];
    let isValid = true;
    const newErrors = {};

    fields.forEach((field) => {
      const error = validateField(field, customerInfo[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
      setTouched((prev) => ({ ...prev, [field]: true }));
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId, productName) => {
    if (confirm(`Remove "${productName}" from your cart?`)) {
      removeFromCart(productId);
      toast.success("Item removed from cart");
    }
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (confirm("Are you sure you want to clear your entire cart?")) {
      clearCart();
      toast.success("Cart cleared");
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error("Please fix all errors before placing order");
      return;
    }

    setIsProcessing(true);

    try {
      const subtotal = getCartTotal();
      const discount = couponDiscount;
      const totalAfterDiscount = subtotal - discount;
      const grandTotal = totalAfterDiscount + deliveryCharge;

      // Format items for the order - Extract the original product ID
      const orderItems = cartItems.map((item) => {
        // Extract the actual product ID (remove the weight suffix)
        let productId = item._id;
        // If the ID contains a dash, it's likely the composite ID from cart
        if (productId.includes("-")) {
          // Get the part before the dash (the actual product ID)
          productId = productId.split("-")[0];
        }

        return {
          productId: productId, // Now this will be a valid ObjectId
          name: item.name,
          sku: item.SKU || "",
          weight: item.weight || "",
          weightInGrams: item.weightInGrams || 0,
          quantity: item.selectedQuantity,
          price: item.sellingPrice,
          originalPrice: item.originalPrice || item.sellingPrice,
          total: item.sellingPrice * item.selectedQuantity,
        };
      });

      const orderData = {
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          thana: customerInfo.thana,
          district: customerInfo.district,
        },
        items: orderItems,
        subtotal: subtotal,
        discount: discount,
        coupon: appliedCoupon
          ? {
              code: appliedCoupon.code,
              type: appliedCoupon.type,
              discount: discount,
            }
          : null,
        deliveryCharge: deliveryCharge,
        totalWeight: totalWeight,
        total: grandTotal,
        status: "pending",
        notes: "",
        orderDate: new Date().toISOString(),
        paymentMethod: "cod",
        paymentStatus: "pending",
      };

      console.log("Sending order data:", orderData);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Order #${data.order.orderNumber} placed successfully!`);

        clearCart();
        setCustomerInfo({
          name: "",
          phone: "",
          address: "",
          thana: "",
          district: "",
        });
        setErrors({});
        setTouched({});
        setDeliveryCharge(0);
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setAvailableCoupons([]);
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cartTotal = getCartTotal();
  const cartCount = getCartCount();
  const subtotal = cartTotal;
  const discount = couponDiscount;
  const totalAfterDiscount = subtotal - discount;
  const grandTotal = totalAfterDiscount + deliveryCharge;

  if (!isMounted) {
    return null;
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <FaShoppingCart className="text-4xl text-gray-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#3A393D] mb-3">
            Your Cart is Empty
          </h2>
          <p className="text-gray-500 mb-6">
            Looks like you {"haven't"} added any items to your cart yet.
          </p>
          <Link
            href="/all-products"
            className="inline-flex items-center gap-2 bg-[#559F34] hover:bg-[#45802A] text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <FaArrowLeft /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 md:mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-3xl font-bold text-[#3A393D] flex items-center gap-2">
              <FaShoppingCart className="text-[#559F34] text-base md:text-2xl" />
              <span className="hidden sm:inline">Shopping Cart</span>
              <span className="sm:hidden">Cart</span>
              <span className="text-xs md:text-sm font-normal text-gray-500 bg-gray-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                {cartCount}
              </span>
            </h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/all-products"
              className="inline-flex items-center gap-1 text-xs md:text-sm text-[#3A393D] hover:text-[#559F34] px-2 md:px-4 py-1 md:py-2 rounded-lg border border-gray-200 hover:border-[#559F34] transition-colors"
            >
              <FaArrowLeft className="text-xs" />{" "}
              <span className="hidden sm:inline">Continue</span>
            </Link>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="inline-flex items-center gap-1 text-xs md:text-sm text-red-600 hover:text-red-700 px-2 md:px-4 py-1 md:py-2 rounded-lg border border-red-200 hover:border-red-300 transition-colors"
              >
                <FaTrash className="text-xs" />{" "}
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                <div className="flex gap-3 md:gap-4 p-3 md:p-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {item.photos?.[0]?.url ? (
                      <Image
                        src={item.photos[0].url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaShoppingCart size={24} />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-[11px] md:text-base font-semibold text-[#3A393D] hover:text-[#559F34] transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>

                        {item.weight && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] md:text-[10px] font-medium rounded-md border border-blue-100">
                            ⚖️ {item.weight}
                          </span>
                        )}

                        {item.SKU && (
                          <p className="text-[10px] md:text-xs text-gray-400 hidden sm:block">
                            SKU: {item.SKU}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item._id, item.name)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 text-xs md:text-sm hover:bg-red-50 rounded-full flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <FaTrash size={13} className="md:text-base" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="text-sm md:text-lg font-bold text-[#559F34]">
                          ৳{item.sellingPrice.toFixed(2)}
                        </span>
                        {item.originalPrice &&
                          item.originalPrice > item.sellingPrice && (
                            <span className="text-[10px] md:text-sm text-gray-400 line-through">
                              ৳{item.originalPrice.toFixed(2)}
                            </span>
                          )}
                      </div>

                      <div className="flex items-center gap-1 md:gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              item.selectedQuantity - 1,
                            )
                          }
                          disabled={item.selectedQuantity <= 1}
                          className="w-5 h-5 md:w-9 md:h-9 flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shadow-sm"
                        >
                          <FaMinus size={10} className="md:text-xs" />
                        </button>

                        <span className="w-6 md:w-8 text-center font-bold text-sm md:text-base text-[#3A393D]">
                          {item.selectedQuantity}
                        </span>

                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              item.selectedQuantity + 1,
                            )
                          }
                          disabled={item.selectedQuantity >= item.maxQuantity}
                          className="w-5 h-5 md:w-9 md:h-9 flex items-center justify-center rounded-lg bg-[#559F34] hover:bg-[#45802A] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shadow-sm"
                        >
                          <FaPlus size={10} className="md:text-xs" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right mt-1">
                      <p className="text-[10px] md:text-xs text-gray-400">
                        Subtotal:{" "}
                        <span className="font-semibold text-[#3A393D]">
                          ৳
                          {(item.sellingPrice * item.selectedQuantity).toFixed(
                            2,
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Customer Information */}
          <div className="lg:col-span-1">
            <div className="space-y-4 md:space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-4 md:p-6">
                <h3 className="text-sm md:text-lg font-bold text-[#3A393D] mb-3 md:mb-4 pb-2 md:pb-3 border-b flex items-center gap-2">
                  <FaUser className="text-[#559F34] text-sm md:text-base" />
                  Customer Details
                </h3>

                <form className="space-y-3 md:space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-[#3A393D] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-sm" />
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        onBlur={() => handleBlur("name")}
                        className={`w-full pl-8 md:pl-10 pr-3 py-1.5 md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-[#3A393D] text-xs md:text-sm ${
                          touched.name && errors.name
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {touched.name && errors.name && (
                      <p className="text-red-500 text-[10px] md:text-xs mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-[#3A393D] mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-sm" />
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          handleInputChange(
                            "phone",
                            e.target.value.replace(/\D/g, ""),
                          )
                        }
                        onBlur={() => handleBlur("phone")}
                        maxLength={11}
                        className={`w-full pl-8 md:pl-10 pr-3 py-1.5 md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-[#3A393D] text-xs md:text-sm ${
                          touched.phone && errors.phone
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter 11 digit phone number"
                      />
                    </div>
                    {touched.phone && errors.phone ? (
                      <p className="text-red-500 text-[10px] md:text-xs mt-1">
                        {errors.phone}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-[10px] md:text-xs mt-1 hidden sm:block">
                        Must be exactly 11 digits
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-[#3A393D] mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaHome className="absolute left-3 top-2.5 text-gray-400 text-xs md:text-sm" />
                      <textarea
                        value={customerInfo.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        onBlur={() => handleBlur("address")}
                        rows={2}
                        className={`w-full pl-8 md:pl-10 pr-3 py-1.5 md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-[#3A393D] text-xs md:text-sm resize-none ${
                          touched.address && errors.address
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="House #, Road #, Apartment, etc."
                      />
                    </div>
                    {touched.address && errors.address && (
                      <p className="text-red-500 text-[10px] md:text-xs mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* District & Thana */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-[#3A393D] mb-1">
                        District <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-sm" />
                        <select
                          value={customerInfo.district}
                          onChange={(e) =>
                            handleInputChange("district", e.target.value)
                          }
                          onBlur={() => handleBlur("district")}
                          className={`w-full pl-8 md:pl-10 pr-3 py-1.5 md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-[#3A393D] text-xs md:text-sm appearance-none ${
                            touched.district && errors.district
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          disabled={districtsLoading}
                        >
                          <option value="">
                            {districtsLoading
                              ? "Loading..."
                              : "Select District"}
                          </option>
                          {districts.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      </div>
                      {touched.district && errors.district && (
                        <p className="text-red-500 text-[10px] md:text-xs mt-1">
                          {errors.district}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-[#3A393D] mb-1">
                        Thana <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-sm" />
                        <select
                          value={customerInfo.thana}
                          onChange={(e) =>
                            handleInputChange("thana", e.target.value)
                          }
                          onBlur={() => handleBlur("thana")}
                          disabled={!customerInfo.district || districtsLoading}
                          className={`w-full pl-8 md:pl-10 pr-3 py-1.5 md:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-[#3A393D] text-xs md:text-sm appearance-none ${
                            touched.thana && errors.thana
                              ? "border-red-500"
                              : "border-gray-300"
                          } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        >
                          <option value="">
                            {!customerInfo.district
                              ? "Select district first"
                              : "Select Thana"}
                          </option>
                          {thanas.map((thana) => (
                            <option key={thana} value={thana}>
                              {thana}
                            </option>
                          ))}
                        </select>
                      </div>
                      {touched.thana && errors.thana && (
                        <p className="text-red-500 text-[10px] md:text-xs mt-1">
                          {errors.thana}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Order Summary with Coupons */}
              <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-4 md:p-6 sticky top-4">
                <h3 className="text-sm md:text-lg font-bold text-[#3A393D] mb-3 md:mb-4 pb-2 md:pb-3 border-b">
                  Order Summary
                </h3>

                {/* Available Coupons Section */}
                {availableCoupons.length > 0 && !appliedCoupon && (
                  <div className="mb-3 pb-3 border-b">
                    <div className="flex items-center gap-1.5 mb-2">
                      <FaGift className="text-[#559F34] text-xs" />
                      <span className="text-xs font-medium text-[#3A393D]">
                        Available Offers
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {availableCoupons.map((coupon) => (
                        <button
                          key={coupon._id}
                          onClick={() => applySuggestedCoupon(coupon)}
                          className="w-full flex items-center justify-between text-left px-2 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <FaTag className="text-[#559F34] text-[10px]" />
                            <span className="font-medium text-[#3A393D]">
                              {coupon.code}
                            </span>
                            <span className="text-gray-500">
                              {coupon.type === "fixed"
                                ? `৳${coupon.amount} off`
                                : `${coupon.percentage}% off`}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#559F34] font-medium">
                            Apply
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Subtotal ({cartCount} items)
                    </span>
                    <span className="font-medium text-[#3A393D]">
                      ৳{subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Total Weight */}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Weight</span>
                    <span className="font-medium text-[#3A393D]">
                      {totalWeight.toFixed(2)} kg
                    </span>
                  </div>

                  {/* Coupon Section */}
                  <div className="pt-1">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
                        <div>
                          <span className="text-xs font-medium text-green-700">
                            Coupon Applied: {appliedCoupon.code}
                          </span>
                          <span className="text-xs text-green-600 block">
                            - ৳{discount.toFixed(2)}{" "}
                            {appliedCoupon.type === "percentage"
                              ? `(${appliedCoupon.discountDisplay})`
                              : ""}
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          aria-label="Remove coupon"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={() => setShowCouponInput(!showCouponInput)}
                          className="text-[#559F34] hover:text-[#45802A] text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <FaTag /> {showCouponInput ? "Hide" : "Apply Coupon"}
                        </button>

                        {showCouponInput && (
                          <div className="mt-2 flex gap-2 w-full">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) =>
                                setCouponCode(e.target.value.toUpperCase())
                              }
                              placeholder="Enter coupon code"
                              className="flex-1 min-w-[60px] text-gray-600 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34]"
                            />
                            <button
                              onClick={() => applyCoupon(couponCode)}
                              disabled={couponLoading || !couponCode}
                              className="px-3 py-1.5 bg-[#559F34] hover:bg-[#45802A] text-white text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
                            >
                              {couponLoading ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                "Apply"
                              )}
                            </button>
                          </div>
                        )}
                        {couponError && (
                          <p className="text-red-500 text-[10px] mt-1">
                            {couponError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delivery Charge */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Delivery Charge</span>
                    <span className="font-medium text-[#559F34]">
                      {deliveryChargeLoading ? (
                        <span className="inline-block w-12 h-4 bg-gray-200 rounded animate-pulse"></span>
                      ) : (
                        `৳${deliveryCharge.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {!customerInfo.district && cartItems.length > 0 && (
                    <p className="text-[10px] text-yellow-600 text-center">
                      ⚠️ Select a district to calculate delivery charge
                    </p>
                  )}

                  <div className="border-t pt-2 md:pt-3 mt-2 md:mt-3">
                    {discount > 0 && (
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-600">Discount</span>
                        <span className="text-green-600 font-medium">
                          - ৳{discount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm md:text-base font-bold">
                      <span className="text-[#3A393D]">Total</span>
                      <span className="text-[#559F34] text-base md:text-xl">
                        ৳{grandTotal.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[8px] md:text-xs text-gray-400 mt-1 text-right">
                      *All prices include VAT
                    </p>
                  </div>
                </div>

                {/* Confirm Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    isProcessing ||
                    cartItems.length === 0 ||
                    !customerInfo.district
                  }
                  className="w-full mt-4 md:mt-6 bg-[#559F34] hover:bg-[#45802A] text-white font-medium py-2.5 md:py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaLock size={14} className="md:text-base" /> Confirm
                      Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartClient;
