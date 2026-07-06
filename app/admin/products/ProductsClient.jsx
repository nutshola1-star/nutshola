// app/admin/products/ProductsClient.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import AdminMenu from "../../components/menu/AdminMenu";
import { Editor } from "@tinymce/tinymce-react";
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
  FaBox,
  FaTag,
  FaList,
  FaPlusCircle,
  FaToggleOn,
  FaToggleOff,
  FaSearch,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProductsClient = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

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

  // Product form states
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "",
    pricing: [{ weight: "", unit: "kg", price: "", discountedPrice: "" }],
    photos: [],
    isActive: true,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [productPhotos, setProductPhotos] = useState([]);
  const [productPhotoPreviews, setProductPhotoPreviews] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [removePhotoIds, setRemovePhotoIds] = useState([]);
  const productFileInputRef = useRef(null);
  const [hasDiscount, setHasDiscount] = useState(false);

  // Editor content state
  const [editorContent, setEditorContent] = useState("");

  // Fetch categories and products on mount
  useEffect(() => {
    // eslint-disable-next-line
    fetchCategories();
    // eslint-disable-next-line
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/product");
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to fetch products");
    }
  };

  // Category CRUD functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setRemoveImage(false);

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

  const resetCategoryForm = () => {
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
    setIsCategoryOpen(true);
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

      const url = "/api/category";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: form,
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingCategory ? "Category updated!" : "Category created!",
        );
        fetchCategories();
        resetCategoryForm();
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
          resetCategoryForm();
        }
      } else {
        toast.error(data.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Delete category error:", error);
      toast.error("Failed to delete category");
    }
  };

  const cancelCategoryEdit = () => {
    resetCategoryForm();
  };

  // Product CRUD functions
  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePricingChange = (index, field, value) => {
    const updatedPricing = [...productForm.pricing];
    updatedPricing[index][field] = value;
    setProductForm((prev) => ({ ...prev, pricing: updatedPricing }));
  };

  const addPricingRow = () => {
    setProductForm((prev) => ({
      ...prev,
      pricing: [
        ...prev.pricing,
        { weight: "", unit: "kg", price: "", discountedPrice: "" },
      ],
    }));
  };

  const removePricingRow = (index) => {
    if (productForm.pricing.length <= 1) {
      toast.error("At least one pricing option is required");
      return;
    }
    const updatedPricing = productForm.pricing.filter((_, i) => i !== index);
    setProductForm((prev) => ({ ...prev, pricing: updatedPricing }));
  };

  const handleProductPhotos = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 10MB)`);
        return;
      }
    }

    setProductPhotos((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setProductPhotoPreviews((prev) => [...prev, ...newPreviews]);

    if (productFileInputRef.current) {
      productFileInputRef.current.value = "";
    }
  };

  const removeProductPhoto = (index, isExisting = false) => {
    if (isExisting) {
      const photoToRemove = existingPhotos[index];
      setRemovePhotoIds((prev) => [...prev, photoToRemove.public_id]);
      setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      URL.revokeObjectURL(productPhotoPreviews[index]);
      setProductPhotos((prev) => prev.filter((_, i) => i !== index));
      setProductPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      category: "",
      pricing: [{ weight: "", unit: "kg", price: "", discountedPrice: "" }],
      photos: [],
      isActive: true,
    });
    setEditorContent("");
    setEditingProduct(null);
    setProductPhotos([]);
    setProductPhotoPreviews([]);
    setExistingPhotos([]);
    setRemovePhotoIds([]);
    setHasDiscount(false);
    if (productFileInputRef.current) {
      productFileInputRef.current.value = "";
    }
  };

  const openAddProductModal = () => {
    resetProductForm();
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      category: product.category?._id || product.category,
      pricing: product.pricing || [
        { weight: "", unit: "kg", price: "", discountedPrice: "" },
      ],
      isActive: product.isActive !== undefined ? product.isActive : true,
    });
    setEditorContent(product.description || "");
    setExistingPhotos(product.photos || []);
    setProductPhotos([]);
    setProductPhotoPreviews([]);
    setRemovePhotoIds([]);

    const hasDisc = product.pricing?.some(
      (p) => p.discountedPrice && p.discountedPrice > 0,
    );
    setHasDiscount(hasDisc || false);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    resetProductForm();
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!productForm.name) {
      toast.error("Product name is required");
      return;
    }
    if (!productForm.category) {
      toast.error("Category is required");
      return;
    }
    if (!editorContent) {
      toast.error("Description is required");
      return;
    }

    // Validate pricing
    for (const pricing of productForm.pricing) {
      if (!pricing.weight || !pricing.price) {
        toast.error("Weight and price are required for all pricing options");
        return;
      }
    }

    // Check if at least one photo is present (new or existing)
    if (productPhotos.length === 0 && existingPhotos.length === 0) {
      toast.error("At least one product photo is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const form = new FormData();
      form.append("name", productForm.name);
      form.append("description", editorContent);
      form.append("category", productForm.category);
      form.append("isActive", productForm.isActive ? "true" : "false");

      // Append pricing
      productForm.pricing.forEach((pricing, index) => {
        form.append(`pricing[${index}][weight]`, pricing.weight);
        form.append(`pricing[${index}][unit]`, pricing.unit || "kg");
        form.append(`pricing[${index}][price]`, pricing.price);
        if (pricing.discountedPrice) {
          form.append(
            `pricing[${index}][discountedPrice]`,
            pricing.discountedPrice,
          );
        }
      });

      // Append new photos
      productPhotos.forEach((photo) => {
        form.append("photos", photo);
      });

      // Append removed photo IDs
      removePhotoIds.forEach((public_id) => {
        form.append("removePhotos[]", public_id);
      });

      if (editingProduct) {
        form.append("productId", editingProduct._id);
      }

      const url = "/api/product";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: form,
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingProduct ? "Product updated!" : "Product created!");
        fetchProducts();
        closeProductModal();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Product submit error:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [toggleUpdateId, setToggleUpdateId] = useState(null);

  const handleToggleActive = async (productId, currentStatus) => {
    setToggleUpdateId(productId);
    try {
      const response = await fetch(`/api/product/${productId}/toggle-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Product ${!currentStatus ? "activated" : "deactivated"}!`,
        );
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error("Failed to update product status");
    } finally {
      setToggleUpdateId(null);
    }
  };

  // Delete product with confirm dialog
  const handleDeleteProduct = async (productId) => {
    setDeletingProductId(productId);
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/product?id=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Product deleted successfully!");
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeletingProductId(null);
    }
  };

  // Filter products by search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.SKU?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
        <main className="px-2 md:px-8 pb-8 flex-1 space-y-6">
          {/* Category Section - Keep as is */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-[#3A393D] hover:bg-[#4a494d] transition-colors"
            >
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <FaList className="text-[#7ECB2A]" />
                Product Categories
              </h3>
              <div className="text-white">
                {isCategoryOpen ? <FaMinus size={20} /> : <FaPlus size={20} />}
              </div>
            </button>

            {isCategoryOpen && (
              <div className="p-4 md:p-6">
                {/* Category Form */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-[#3A393D] mb-4 flex items-center gap-2">
                    <FaTag className="text-[#559F34]" />
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
                              {imageFile
                                ? imageFile.name
                                : "Choose image (max 10MB)"}
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
                      {editingCategory &&
                        editingCategory.image?.url &&
                        !imageFile && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Current image will be kept unless you upload a new
                              one or click remove.
                            </p>
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
                          </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 bg-[#7ECB2A] text-white rounded-lg hover:bg-[#559F34] transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <FaSave /> {editingCategory ? "Update" : "Create"}
                          </>
                        )}
                      </button>
                      {editingCategory && (
                        <button
                          type="button"
                          onClick={cancelCategoryEdit}
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
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow flex flex-col items-center text-center"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden mb-2">
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
                        <div className="flex-1 min-w-0 w-full">
                          <h5 className="font-semibold text-[#3A393D] truncate text-sm sm:text-base">
                            {category.name}
                          </h5>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {category.bengaliName}
                          </p>
                          <div className="flex justify-center gap-2 mt-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-[#559F34] hover:text-[#3A393D] transition-colors"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <FaTrash size={14} />
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

          {/* Product Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setIsProductOpen(!isProductOpen)}
              className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-[#559F34] hover:bg-[#4a8a2e] transition-colors"
            >
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <FaBox className="text-[#7ECB2A]" />
                Products Management
              </h3>
              <div className="text-white flex items-center gap-4">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    openAddProductModal();
                  }}
                  className="flex items-center gap-2 px-3 py-1 bg-white text-[#559F34] rounded-lg hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                >
                  <FaPlus /> Add Product
                </span>
                {isProductOpen ? <FaMinus size={20} /> : <FaPlus size={20} />}
              </div>
            </button>

            {isProductOpen && (
              <div className="p-4 md:p-6">
                {/* Search Bar */}
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products by name, SKU, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {filteredProducts.length} product
                    {filteredProducts.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Products Table */}
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#559F34]"></div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaBox className="text-4xl mx-auto mb-3 text-gray-300" />
                    <p>No products found. Create your first product!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 font-semibold text-[#3A393D]">
                            Photo
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-[#3A393D]">
                            Name
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-[#3A393D]">
                            SKU
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-[#3A393D]">
                            Category
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-[#3A393D]">
                            Price
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-[#3A393D]">
                            Status
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-[#3A393D]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr
                            key={product._id}
                            className="border-b hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                {product.photos && product.photos.length > 0 ? (
                                  <img
                                    src={product.photos[0].url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <FaImage size={16} />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium text-[#3A393D]">
                              {product.name}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {product.SKU || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {product.category?.name || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {product.pricing &&
                                product.pricing.length > 0 && (
                                  <>
                                    ৳
                                    {Math.min(
                                      ...product.pricing.map((p) => p.price),
                                    )}
                                    {product.pricing.some(
                                      (p) => p.discountedPrice,
                                    ) && (
                                      <span className="ml-1 line-through text-gray-400">
                                        ৳
                                        {Math.min(
                                          ...product.pricing.map(
                                            (p) => p.discountedPrice || p.price,
                                          ),
                                        )}
                                      </span>
                                    )}
                                  </>
                                )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {
                                <button
                                  onClick={() =>
                                    handleToggleActive(
                                      product._id,
                                      product.isActive,
                                    )
                                  }
                                  disabled={toggleUpdateId === product._id}
                                  className="text-2xl focus:outline-none"
                                >
                                  {toggleUpdateId === product._id ? (
                                    <FaSpinner className="animate-spin text-2xl text-gray-400" />
                                  ) : product.isActive ? (
                                    <FaToggleOn className="text-[#7ECB2A] hover:text-[#559F34]" />
                                  ) : (
                                    <FaToggleOff className="text-gray-400 hover:text-gray-600" />
                                  )}
                                </button>
                              }
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => openEditProductModal(product)}
                                  className="text-[#559F34] hover:text-[#3A393D] transition-colors"
                                  title="Edit product"
                                >
                                  <FaEdit size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(product._id)
                                  }
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                  title="Delete product"
                                >
                                  {deletingProductId === product._id ? (
                                    <FaSpinner
                                      className="animate-spin"
                                      size={16}
                                    />
                                  ) : (
                                    <FaTrash size={16} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              onClick={closeProductModal}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#3A393D] flex items-center gap-2">
                    <FaBox className="text-[#559F34]" />
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <button
                    onClick={closeProductModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmitProduct}
                  className="space-y-4 max-h-[70vh] overflow-y-auto px-1"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#3A393D] mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                        placeholder="e.g., Premium Cashew Nuts"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3A393D] mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={productForm.category}
                        onChange={handleProductInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name} ({cat.bengaliName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description with TinyMCE Editor */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-2">
                      Description *
                    </label>
                    <Editor
                      apiKey={
                        process.env.NEXT_PUBLIC_TINYMCE_API_KEY ||
                        "uesfoa9e7dbi9854pww8r021oihrhzgfomgc5ge82a1k4p8n"
                      }
                      value={editorContent}
                      onEditorChange={(content) => setEditorContent(content)}
                      init={{
                        height: 300,
                        menubar: false,
                        plugins: [
                          "advlist",
                          "autolink",
                          "lists",
                          "link",
                          "image",
                          "charmap",
                          "preview",
                          "anchor",
                          "searchreplace",
                          "visualblocks",
                          "code",
                          "fullscreen",
                          "insertdatetime",
                          "media",
                          "table",
                          "help",
                          "wordcount",
                        ],
                        toolbar:
                          "undo redo | blocks | " +
                          "bold italic forecolor | alignleft aligncenter " +
                          "alignright alignjustify | bullist numlist outdent indent | " +
                          "removeformat | help",
                        content_style:
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        branding: false,
                        promotion: false,
                      }}
                    />
                  </div>

                  {/* Pricing Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-[#3A393D]">
                        Pricing Options *
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-[#3A393D]">
                          <input
                            type="checkbox"
                            checked={hasDiscount}
                            onChange={(e) => setHasDiscount(e.target.checked)}
                            className="w-4 h-4 text-[#7ECB2A] rounded"
                          />
                          Has Discount?
                        </label>
                        <button
                          type="button"
                          onClick={addPricingRow}
                          className="flex items-center gap-1 text-sm text-[#559F34] hover:text-[#3A393D]"
                        >
                          <FaPlusCircle /> Add Option
                        </button>
                      </div>
                    </div>

                    {productForm.pricing.map((pricing, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2 p-3 bg-gray-50 rounded-lg border"
                      >
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Weight
                          </label>
                          <input
                            type="number"
                            value={pricing.weight}
                            onChange={(e) =>
                              handlePricingChange(
                                index,
                                "weight",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                            placeholder="e.g., 500"
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Unit
                          </label>
                          <select
                            value={pricing.unit}
                            onChange={(e) =>
                              handlePricingChange(index, "unit", e.target.value)
                            }
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                          >
                            <option value="kg">kg</option>
                            <option value="g">gm</option>
                            <option value="piece">piece</option>
                            <option value="pack">pack</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Price (৳)
                          </label>
                          <input
                            type="number"
                            value={pricing.price}
                            onChange={(e) =>
                              handlePricingChange(
                                index,
                                "price",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                            placeholder="e.g., 500"
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Discounted Price
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={pricing.discountedPrice}
                              onChange={(e) =>
                                handlePricingChange(
                                  index,
                                  "discountedPrice",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 disabled:opacity-50 disabled:cursor-not-allowed py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                              placeholder="e.g., 400"
                              disabled={!hasDiscount}
                              min="0"
                              step="0.01"
                            />
                            {productForm.pricing.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePricingRow(index)}
                                className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                                title="Remove pricing option"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Product Photos */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A393D] mb-1">
                      Product Photos *
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          ref={productFileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleProductPhotos}
                          className="hidden"
                          id="product-photos"
                        />
                        <label
                          htmlFor="product-photos"
                          className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#7ECB2A] transition-colors"
                        >
                          <FaUpload className="text-[#559F34]" />
                          <span className="text-[#3A393D] text-sm">
                            Choose images (max 10MB each)
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
                      {existingPhotos.map((photo, index) => (
                        <div
                          key={`existing-${index}`}
                          className="relative group"
                        >
                          <img
                            src={photo.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeProductPhoto(index, true)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTimesCircle size={14} />
                          </button>
                        </div>
                      ))}
                      {productPhotoPreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeProductPhoto(index, false)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTimesCircle size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-[#3A393D]">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={productForm.isActive}
                        onChange={handleProductInputChange}
                        className="w-4 h-4 text-[#7ECB2A] rounded"
                      />
                      Product is Active
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex text-xs md:text-sm items-center gap-2 px-4 md:px-6 py-2 bg-[#7ECB2A] text-white rounded-lg hover:bg-[#559F34] transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <FaSave />{" "}
                          {editingProduct ? "Update Product" : "Create Product"}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeProductModal}
                      className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-[#3A393D] rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <FaTimesCircle /> Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsClient;
