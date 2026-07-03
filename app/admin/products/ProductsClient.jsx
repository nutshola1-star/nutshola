// app/admin/products/ProductsClient.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import AdminMenu from "../../components/menu/AdminMenu";
import {
  FaBars,
  FaTimes,
  FaPlus,
  FaMinus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimesCircle,
  FaUpload,
  FaImage,
  FaSpinner,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProductsClient = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category form states
  const [formData, setFormData] = useState({
    name: "",
    bengaliName: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch categories on mount
  useEffect(() => {
    //eslint-disable-next-line
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/category");
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setRemoveImage(false);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImageFile = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (editingCategory && editingCategory.image?.url) {
      setRemoveImage(true);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", bengaliName: "" });
    setEditingCategory(null);
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      bengaliName: category.bengaliName,
    });
    if (category.image?.url) {
      setImagePreview(category.image.url);
    }
    setImageFile(null);
    setRemoveImage(false);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.bengaliName) {
      toast.error("Name and Bengali name are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("bengaliName", formData.bengaliName);
      
      if (editingCategory) {
        form.append("categoryId", editingCategory._id);
        if (removeImage) {
          form.append("removeImage", "true");
        }
      }

      if (imageFile) {
        form.append("image", imageFile);
      }

      const url = editingCategory ? "/api/category" : "/api/category";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: form,
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingCategory ? "Category updated!" : "Category created!");
        fetchCategories();
        resetForm();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Category submit error:", error);
      toast.error("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/category?id=${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Category deleted successfully!");
        fetchCategories();
        if (editingCategory?._id === categoryId) {
          resetForm();
        }
      } else {
        toast.error(data.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Delete category error:", error);
      toast.error("Failed to delete category");
    }
  };

  const cancelEdit = () => {
    resetForm();
  };

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
              Products Management
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Manage your products, categories, and inventory.
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
          {/* Category Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Category Header - Collapsible */}
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-[#3A393D] hover:bg-[#4a494d] transition-colors"
            >
              <h3 className="text-white font-semibold text-lg">
                Product Categories
              </h3>
              <div className="text-white">
                {isCategoryOpen ? <FaMinus size={20} /> : <FaPlus size={20} />}
              </div>
            </button>

            {/* Category Content - Collapsible */}
            {isCategoryOpen && (
              <div className="p-4 md:p-6">
                {/* Category Form */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-[#3A393D] mb-4">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h4>
                  <form onSubmit={handleSubmitCategory} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3A393D] mb-1">
                          Name (English) *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                          placeholder="e.g., Nuts"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3A393D] mb-1">
                          Name (Bengali) *
                        </label>
                        <input
                          type="text"
                          name="bengaliName"
                          value={formData.bengaliName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                          placeholder="e.g., বাদাম"
                          required
                        />
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-[#3A393D] mb-1">
                        Category Image {editingCategory && "(Optional)"}
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="category-image"
                          />
                          <label
                            htmlFor="category-image"
                            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#7ECB2A] transition-colors"
                          >
                            <FaUpload className="text-[#559F34]" />
                            <span className="text-[#3A393D]">
                              {imageFile ? imageFile.name : "Choose image (max 10MB)"}
                            </span>
                          </label>
                        </div>
                        {imagePreview && (
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <img
                              src={imagePreview}
                              alt="Category preview"
                              className="w-full h-full object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={removeImageFile}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <FaTimesCircle size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      {editingCategory && editingCategory.image?.url && !imageFile && (
                        <p className="text-sm text-gray-500 mt-1">
                          Current image will be kept unless you upload a new one or click remove.
                        </p>
                      )}
                      {editingCategory && editingCategory.image?.url && !imageFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setRemoveImage(true);
                            setImagePreview(null);
                          }}
                          className="text-sm text-red-500 hover:text-red-700 mt-1"
                        >
                          Remove existing image
                        </button>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 bg-[#7ECB2A] text-white rounded-lg hover:bg-[#559F34] transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <><FaSpinner className="animate-spin" /> Saving...</>
                        ) : (
                          <><FaSave /> {editingCategory ? "Update" : "Create"}</>
                        )}
                      </button>
                      {editingCategory && (
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-[#3A393D] rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <FaTimesCircle /> Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Categories List */}
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#559F34]"></div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaImage className="text-4xl mx-auto mb-3 text-gray-300" />
                    <p>No categories yet. Create your first category above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow flex items-start gap-4"
                      >
                        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                          {category.image?.url ? (
                            <img
                              src={category.image.url}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FaImage size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-[#3A393D] truncate">
                            {category.name}
                          </h5>
                          <p className="text-sm text-gray-500 truncate">
                            {category.bengaliName}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-[#559F34] hover:text-[#3A393D] transition-colors"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Section - Coming Soon */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold text-[#3A393D] mb-2">
              Products Management
            </h3>
            <p className="text-gray-500">
              Product management features coming soon...
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductsClient;