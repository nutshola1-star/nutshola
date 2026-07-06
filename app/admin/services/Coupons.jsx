// app/admin/services/Coupons.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSpinner,
  FaToggleOn,
  FaToggleOff,
  FaSearch,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Helper function to check if coupon is valid
const isCouponValid = (coupon) => {
  if (!coupon) return false;
  if (!coupon.isActive) return false;

  const now = new Date();
  const startDate = new Date(coupon.startDate);
  const expiryDate = new Date(coupon.expiryDate);

  if (startDate > now) return false;
  if (expiryDate < now) return false;
  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    coupon.usedCount >= coupon.usageLimit
  )
    return false;

  return true;
};

const Coupons = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    type: "fixed",
    amount: "",
    percentage: "",
    maxDiscount: "",
    minPurchase: "",
    usageLimit: "",
    perUserLimit: "1",
    startDate: "",
    expiryDate: "",
    isActive: true,
    description: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Check if user is admin (role 1)
  const isAdmin = user?.role === 1;

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/coupons");
      const data = await response.json();

      if (data.success) {
        setCoupons(data.coupons);
      } else {
        toast.error(data.message || "Failed to fetch coupons");
      }
    } catch (error) {
      console.error("Fetch coupons error:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //eslint-disable-next-line
    fetchCoupons();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const {
      code,
      type,
      amount,
      percentage,
      minPurchase,
      startDate,
      expiryDate,
    } = formData;

    if (!code || code.trim().length < 2) {
      errors.code = "Coupon code is required (minimum 2 characters)";
    }
    if (!type) {
      errors.type = "Coupon type is required";
    }
    if (type === "fixed" && (!amount || parseFloat(amount) <= 0)) {
      errors.amount = "Valid amount is required for fixed discount";
    }
    if (
      type === "percentage" &&
      (!percentage ||
        parseFloat(percentage) <= 0 ||
        parseFloat(percentage) > 100)
    ) {
      errors.percentage = "Valid percentage (1-100) is required";
    }
    if (minPurchase && parseFloat(minPurchase) < 0) {
      errors.minPurchase = "Minimum purchase cannot be negative";
    }
    if (!startDate) {
      errors.startDate = "Start date is required";
    }
    if (!expiryDate) {
      errors.expiryDate = "Expiry date is required";
    }
    if (startDate && expiryDate && new Date(startDate) > new Date(expiryDate)) {
      errors.expiryDate = "Expiry date must be after start date";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open modal for create/edit
  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingId(coupon._id);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        amount: coupon.amount || "",
        percentage: coupon.percentage || "",
        maxDiscount: coupon.maxDiscount || "",
        minPurchase: coupon.minPurchase || "",
        usageLimit: coupon.usageLimit || "",
        perUserLimit: coupon.perUserLimit || "1",
        startDate: coupon.startDate
          ? new Date(coupon.startDate).toISOString().split("T")[0]
          : "",
        expiryDate: coupon.expiryDate
          ? new Date(coupon.expiryDate).toISOString().split("T")[0]
          : "",
        isActive: coupon.isActive,
        description: coupon.description || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        code: "",
        type: "fixed",
        amount: "",
        percentage: "",
        maxDiscount: "",
        minPurchase: "",
        usageLimit: "",
        perUserLimit: "1",
        startDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        isActive: true,
        description: "",
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      code: "",
      type: "fixed",
      amount: "",
      percentage: "",
      maxDiscount: "",
      minPurchase: "",
      usageLimit: "",
      perUserLimit: "1",
      startDate: "",
      expiryDate: "",
      isActive: true,
      description: "",
    });
    setFormErrors({});
  };

  // Handle submit (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingId ? `/api/coupons/${editingId}` : "/api/coupons";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingId
            ? "Coupon updated successfully!"
            : "Coupon created successfully!",
        );
        fetchCoupons();
        closeModal();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to save coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [deleteLoad, setDeleteLoad] = useState(false);

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return;
    }
    setDeleteLoad(true);

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Coupon deleted successfully!");
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to delete coupon");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete coupon");
    } finally {
      setDeleteLoad(false);
    }
  };

  // Toggle coupon active status
  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Coupon ${!currentStatus ? "activated" : "deactivated"}!`,
        );
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to update coupon status");
    }
  };

  // Get type badge color
  const getTypeBadge = (type) => {
    const styles = {
      fixed: "bg-blue-100 text-blue-700",
      percentage: "bg-green-100 text-green-700",
      free_shipping: "bg-purple-100 text-purple-700",
    };
    return styles[type] || "bg-gray-100 text-gray-700";
  };

  // Filter coupons
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || coupon.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-[#559F34] text-4xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#3A393D]">
            Coupon Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total {coupons.length} coupons available
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => openModal()}
            className="bg-[#559F34] hover:bg-[#45802A] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <FaPlus /> Create Coupon
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-gray-600 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 text-gray-600 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm"
        >
          <option value="all">All Types</option>
          <option value="fixed">Fixed Amount</option>
          <option value="percentage">Percentage</option>
        </select>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No coupons found
          </div>
        ) : (
          filteredCoupons.map((coupon) => {
            const isValid = isCouponValid(coupon);
            return (
              <div
                key={coupon._id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  isValid ? "border-green-200" : "border-red-200"
                }`}
              >
                {/* Coupon Code */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-lg font-bold text-[#559F34] font-mono">
                      {coupon.code}
                    </span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(coupon.type)}`}
                    >
                      {coupon.type === "fixed"
                        ? "Fixed"
                        : coupon.type === "percentage"
                          ? "% Off"
                          : "Free Shipping"}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() =>
                        handleToggleActive(coupon._id, coupon.isActive)
                      }
                      className="text-xl"
                    >
                      {coupon.isActive ? (
                        <FaToggleOn className="text-[#559F34] hover:text-[#45802A]" />
                      ) : (
                        <FaToggleOff className="text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  )}
                </div>

                {/* Discount Details */}
                <div className="space-y-1 text-sm">
                  {coupon.type === "fixed" && (
                    <p className="text-gray-700">
                      <span className="font-medium">Discount:</span> ৳
                      {coupon.amount}
                    </p>
                  )}
                  {coupon.type === "percentage" && (
                    <p className="text-gray-700">
                      <span className="font-medium">Discount:</span>{" "}
                      {coupon.percentage}%
                      {coupon.maxDiscount && ` (Max ৳${coupon.maxDiscount})`}
                    </p>
                  )}
                  {coupon.type === "free_shipping" && (
                    <p className="text-gray-700">
                      <span className="font-medium">Free Shipping</span>
                    </p>
                  )}
                  {coupon.minPurchase > 0 && (
                    <p className="text-gray-600 text-xs">
                      Min Purchase: ৳{coupon.minPurchase}
                    </p>
                  )}
                  {coupon.usageLimit && (
                    <p className="text-gray-600 text-xs">
                      Usage: {coupon.usedCount || 0} / {coupon.usageLimit}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs">
                    Valid: {new Date(coupon.startDate).toLocaleDateString()} -{" "}
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </p>
                  {coupon.description && (
                    <p className="text-gray-500 text-xs">
                      {coupon.description}
                    </p>
                  )}
                  {/* Validity Status */}
                  <p
                    className={`text-xs font-medium ${isValid ? "text-green-600" : "text-red-600"}`}
                  >
                    {isValid ? "✓ Valid" : "✗ Invalid"}
                  </p>
                </div>

                {/* Actions */}
                {isAdmin && (
                  <div className="flex justify-end gap-2 mt-3 pt-2 border-t">
                    <button
                      onClick={() => openModal(coupon)}
                      className="text-[#559F34] hover:text-[#3A393D] transition-colors"
                      title="Edit"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      {deleteLoad ? <FaSpinner /> : <FaTrash size={16} />}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[65] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={closeModal}
            ></div>

            <div className="relative bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#3A393D]">
                  {editingId ? "Edit Coupon" : "Create New Coupon"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Code */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm uppercase ${
                        formErrors.code ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., SUMMER50"
                    />
                    {formErrors.code && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.code}
                      </p>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Coupon Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm"
                    >
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>

                  {/* Amount (for fixed type) */}
                  {formData.type === "fixed" && (
                    <div>
                      <label className="block text-sm font-medium text-[#3A393D] mb-1">
                        Discount Amount (৳){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm ${
                          formErrors.amount
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g., 50"
                      />
                      {formErrors.amount && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.amount}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Percentage (for percentage type) */}
                  {formData.type === "percentage" && (
                    <div>
                      <label className="block text-sm font-medium text-[#3A393D] mb-1">
                        Percentage (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="percentage"
                        value={formData.percentage}
                        onChange={handleInputChange}
                        className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm ${
                          formErrors.percentage
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g., 10"
                        min="1"
                        max="100"
                      />
                      {formErrors.percentage && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.percentage}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Max Discount (for percentage type) */}
                  {formData.type === "percentage" && (
                    <div>
                      <label className="block text-sm font-medium text-[#3A393D] mb-1">
                        Max Discount (৳)
                      </label>
                      <input
                        type="number"
                        name="maxDiscount"
                        value={formData.maxDiscount}
                        onChange={handleInputChange}
                        className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm"
                        placeholder="e.g., 500"
                        min="0"
                      />
                    </div>
                  )}

                  {/* Min Purchase */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Minimum Purchase (৳){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="minPurchase"
                      value={formData.minPurchase}
                      onChange={handleInputChange}
                      className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm ${
                        formErrors.minPurchase
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., 1000"
                      min="0"
                    />
                    {formErrors.minPurchase && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.minPurchase}
                      </p>
                    )}
                  </div>

                  {/* Usage Limit */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Usage Limit (Leave empty for unlimited)
                    </label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm"
                      placeholder="e.g., 100"
                      min="1"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm ${
                        formErrors.startDate
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.startDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.startDate}
                      </p>
                    )}
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className={`text-gray-600 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm ${
                        formErrors.expiryDate
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.expiryDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.expiryDate}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#559F34] text-sm"
                      placeholder="Brief description of the coupon"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-[#3A393D]">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#559F34] rounded"
                      />
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#559F34] hover:bg-[#45802A] text-white py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <FaSave /> {editingId ? "Update" : "Create"}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
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

export default Coupons;
