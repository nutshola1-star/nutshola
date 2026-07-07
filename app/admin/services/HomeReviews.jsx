"use client";

import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaStar,
  FaStarHalfAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaSave,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const HomeReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    reviewerName: "",
    reviewerDistrict: "",
    rating: 5,
    reviewText: "",
    isActive: true,
    order: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user && (user.role === 1 || user.role === 2);

  // Fetch reviews
  useEffect(() => {
    //eslint-disable-next-line
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reviews?limit=100");
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (review = null) => {
    if (review) {
      setEditingReview(review);
      setFormData({
        reviewerName: review.reviewerName,
        reviewerDistrict: review.reviewerDistrict,
        rating: review.rating,
        reviewText: review.reviewText,
        isActive: review.isActive,
        order: review.order || 0,
      });
    } else {
      setEditingReview(null);
      setFormData({
        reviewerName: "",
        reviewerDistrict: "",
        rating: 5,
        reviewText: "",
        isActive: true,
        order: reviews.length,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReview(null);
    setFormData({
      reviewerName: "",
      reviewerDistrict: "",
      rating: 5,
      reviewText: "",
      isActive: true,
      order: 0,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "rating"
            ? parseInt(value)
            : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingReview
        ? `/api/reviews/${editingReview._id}`
        : "/api/reviews";

      const method = editingReview ? "PUT" : "POST";

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
          editingReview
            ? "Review updated successfully!"
            : "Review added successfully!",
        );
        handleCloseModal();
        fetchReviews();
      } else {
        toast.error(data.message || "Failed to save review");
      }
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Review deleted successfully!");
        fetchReviews();
      } else {
        toast.error(data.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const handleToggleStatus = async (review) => {
    try {
      const response = await fetch(`/api/reviews/${review._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...review,
          isActive: !review.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Review ${data.data.isActive ? "activated" : "deactivated"} successfully!`,
        );
        fetchReviews();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400 text-xs sm:text-sm" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400 text-xs sm:text-sm" />);
    }

    const remaining = 5 - stars.length;
    for (let i = 0; i < remaining; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300 text-xs sm:text-sm" />);
    }

    return stars;
  };

  return (
    <div>
      {/* Add Review Button - Sticky at top on mobile */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#3A393D]">
              Review Management
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Manage customer reviews ({reviews.length} total)
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto bg-[#559F34] text-white px-4 py-2.5 rounded-lg hover:bg-[#7ECB2A] transition-colors flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
          >
            <FaPlus className="text-sm" />
            Add Review
          </button>
        </div>
      </div>

      <main className="px-2 sm:px-4 md:px-8 pb-8 flex-1">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#559F34]"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mt-4">
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No reviews found. Add your first review!
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reviews.map((review, index) => (
                    <div key={review._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#559F34] to-[#7ECB2A] flex items-center justify-center text-white text-xs flex-shrink-0">
                            <FaUser />
                          </div>
                          <div>
                            <p className="font-semibold text-[#3A393D] text-sm">
                              {review.reviewerName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {review.reviewerDistrict}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(review)}
                            className="p-1.5 text-gray-500 hover:text-blue-500 transition-colors"
                            title={review.isActive ? "Deactivate" : "Activate"}
                          >
                            {review.isActive ? (
                              <FaEye className="text-xs" />
                            ) : (
                              <FaEyeSlash className="text-xs" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenModal(review)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleDelete(review._id)}
                            className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                            title="Delete"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex gap-0.5">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({review.rating}/5)
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {review.reviewText}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            review.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {review.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gradient-to-r from-[#559F34] to-[#7ECB2A]">
                  <tr>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-white text-xs md:text-sm font-semibold">
                      #
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-white text-xs md:text-sm font-semibold">
                      Reviewer
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-white text-xs md:text-sm font-semibold">
                      District
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-white text-xs md:text-sm font-semibold">
                      Rating
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-white text-xs md:text-sm font-semibold">
                      Review
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-white text-xs md:text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-white text-xs md:text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500 text-sm">
                        No reviews found. Add your first review!
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review, index) => (
                      <tr
                        key={review._id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-[#3A393D]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-[#559F34] to-[#7ECB2A] flex items-center justify-center text-white text-xs md:text-sm flex-shrink-0">
                              <FaUser />
                            </div>
                            <span className="truncate max-w-[80px] md:max-w-[120px]">
                              {review.reviewerName}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 truncate max-w-[80px] md:max-w-[120px]">
                          {review.reviewerDistrict}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                          <div className="flex gap-0.5">
                            {renderStars(review.rating)}
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 max-w-[120px] md:max-w-[200px] truncate">
                          {review.reviewText}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-semibold ${
                              review.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {review.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <button
                              onClick={() => handleToggleStatus(review)}
                              className="p-1.5 text-gray-500 hover:text-blue-500 transition-colors"
                              title={review.isActive ? "Deactivate" : "Activate"}
                            >
                              {review.isActive ? (
                                <FaEye className="text-xs md:text-sm" />
                              ) : (
                                <FaEyeSlash className="text-xs md:text-sm" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenModal(review)}
                              className="p-1.5 text-blue-500 hover:text-blue-700 transition-colors"
                              title="Edit"
                            >
                              <FaEdit className="text-xs md:text-sm" />
                            </button>
                            <button
                              onClick={() => handleDelete(review._id)}
                              className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                              title="Delete"
                            >
                              <FaTrash className="text-xs md:text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with count */}
            {reviews.length > 0 && (
              <div className="px-4 md:px-6 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Showing {reviews.length} review{reviews.length > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[65] p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-bold text-[#3A393D]">
                {editingReview ? "Edit Review" : "Add New Review"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-lg md:text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3A393D] mb-2">
                  Reviewer Name *
                </label>
                <input
                  type="text"
                  name="reviewerName"
                  value={formData.reviewerName}
                  onChange={handleInputChange}
                  required
                  className="text-gray-600 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#559F34] focus:border-transparent outline-none text-sm"
                  placeholder="Enter reviewer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A393D] mb-2">
                  District *
                </label>
                <input
                  type="text"
                  name="reviewerDistrict"
                  value={formData.reviewerDistrict}
                  onChange={handleInputChange}
                  required
                  className="text-gray-600 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#559F34] focus:border-transparent outline-none text-sm"
                  placeholder="Enter district"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A393D] mb-2">
                  Rating *
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, rating: star })
                        }
                        className="text-xl md:text-2xl focus:outline-none"
                      >
                        <FaStar
                          className={
                            star <= formData.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A393D] mb-2">
                  Review Text *
                </label>
                <textarea
                  name="reviewText"
                  value={formData.reviewText}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="text-gray-600 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#559F34] focus:border-transparent outline-none resize-none text-sm"
                  placeholder="Write the review..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.reviewText.length}/500 characters
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#3A393D]">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#559F34] focus:ring-[#559F34]"
                  />
                  Active (visible on website)
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 bg-[#559F34] text-white py-2.5 rounded-lg hover:bg-[#7ECB2A] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm font-semibold"
                >
                  <FaSave />
                  {submitting
                    ? "Saving..."
                    : editingReview
                      ? "Update Review"
                      : "Add Review"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeReviews;