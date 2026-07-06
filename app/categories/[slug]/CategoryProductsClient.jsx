// app/categories/[slug]/CategoryProductsClient.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { FaSort, FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

// Product Card Component
const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(0);

  const formatWeight = (weight, unit) => {
    if (weight >= 1000 && unit === "g") {
      return `${weight / 1000}kg`;
    }
    return `${weight}${unit}`;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.pricing || product.pricing.length === 0) return;

    const activePricing = product.pricing[selectedVariant];
    const hasDiscount =
      activePricing.discountedPrice !== null &&
      activePricing.discountedPrice < activePricing.price;
    const currentPrice = hasDiscount
      ? activePricing.discountedPrice
      : activePricing.price;
    const weightString = formatWeight(activePricing.weight, activePricing.unit);

    let weightInGrams = activePricing.weight;
    if (activePricing.unit === "kg") {
      weightInGrams = activePricing.weight * 1000;
    } else if (activePricing.unit === "g") {
      weightInGrams = activePricing.weight;
    } else if (
      activePricing.unit === "piece" ||
      activePricing.unit === "pack"
    ) {
      weightInGrams = 100;
    }

    const cartItem = {
      ...product,
      _id: `${product._id}-${activePricing.weight}${activePricing.unit}`,
      name: `${product.name} - ${weightString}`,
      sellingPrice: currentPrice,
      originalPrice: activePricing.price,
      quantity: product.quantity || 99,
      weight: weightString,
      weightInGrams: weightInGrams,
      selectedVariant: selectedVariant,
    };

    toast.success("Product Added to Cart!");
    addToCart(cartItem, 1);
  };

  if (!product.pricing || product.pricing.length === 0) return null;

  const activePricing = product.pricing[selectedVariant];
  const hasDiscount =
    activePricing.discountedPrice !== null &&
    activePricing.discountedPrice < activePricing.price;
  const displayPrice = hasDiscount
    ? activePricing.discountedPrice
    : activePricing.price;

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col border border-gray-100">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.photos?.[0] && !imageError ? (
            <Image
              src={product.photos[0].url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
              No Image
            </div>
          )}

          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-[#559F34] text-white text-[8px] md:text-xs font-bold px-1 md:px-2 py-0 md:py-1 rounded-full shadow-md">
              Save{" "}
              {Math.round(
                ((activePricing.price - activePricing.discountedPrice) /
                  activePricing.price) *
                  100
              )}
              %
            </div>
          )}
        </div>

        <div className="px-1 md:px-3 py-1 pb-3 flex-1 flex flex-col items-center text-center">
          <h3 className="text-sm md:text-lg font-bold text-[#3A393D] line-clamp-2 group-hover:text-[#559F34] transition-colors mb-1 md:mb-2">
            {product.name}
          </h3>

          <div className="flex items-center justify-center gap-2 mb-1">
            {hasDiscount && (
              <span className="text-xs md:text-sm text-gray-400 line-through">
                ৳{activePricing.price}
              </span>
            )}
            <span className="font-bold text-xs md:text-sm text-[#559F34]">
              ৳{displayPrice}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-1 md:gap-2 mt-auto mb-4 w-full px-0 md:px-2">
            {product.pricing.map((pricing, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedVariant(index);
                }}
                className={`px-1 md:px-3 py-0.5 md:py-1.5 text-xs font-medium rounded border transition-all ${
                  selectedVariant === index
                    ? "border-black text-black bg-[#d2ffa1] shadow-sm"
                    : "border-gray-200 text-gray-500 hover:border-gray-400"
                }`}
              >
                {formatWeight(pricing.weight, pricing.unit)}
              </button>
            ))}
          </div>

          <div className="w-full px-1 md:px-2">
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#559F34] text-white font-bold py-1.5 md:py-2.5 rounded hover:bg-[#45802A] transition-colors uppercase text-xs md:text-sm"
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Shimmer loading component
const ProductShimmer = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div
        key={i}
        className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse"
      >
        <div className="relative h-48 md:h-56 bg-gray-200"></div>
        <div className="p-3 md:p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

// Main component - accepts slug as a prop
const CategoryProductsClient = ({ slug }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    sort: "newest",
    minPrice: undefined,
    maxPrice: undefined,
  });

  const itemsPerPage = 20;

  // Fetch category and products
  const fetchCategoryData = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
     
      const categoryRes = await fetch(`/api/category/slug/${slug}`);
      
      if (!categoryRes.ok) {
        throw new Error(`Category API error: ${categoryRes.status}`);
      }
      
      const categoryData = await categoryRes.json();

      if (!categoryData.success) {
        throw new Error(categoryData.message || "Category not found");
      }

      setCategory(categoryData.category);
      
      // Now fetch products with the category ID
      const categoryId = categoryData.category._id;
      
      let url = `/api/product/client?page=${currentPage}&limit=${itemsPerPage}&sort=${activeFilters.sort}&category=${categoryId}`;

      if (activeFilters.minPrice) {
        url += `&minPrice=${activeFilters.minPrice}`;
      }
      if (activeFilters.maxPrice) {
        url += `&maxPrice=${activeFilters.maxPrice}`;
      }

      const productsRes = await fetch(url);

      
      if (!productsRes.ok) {
        throw new Error(`Products API error: ${productsRes.status}`);
      }
      const productsData = await productsRes.json();

      if (productsData.success) {
        setProducts(productsData.products || []);
        setTotalPages(productsData.pagination?.totalPages || 1);
        setTotalProducts(productsData.pagination?.totalProducts || 0);
      } else {
        throw new Error(productsData.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters.sort, activeFilters.minPrice, activeFilters.maxPrice, itemsPerPage, slug]);

  // Load filters from URL on mount
  useEffect(() => {
    const pageParam = searchParams.get("page");
    const sortParam = searchParams.get("sort");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");

    //eslint-disable-next-line
    if (pageParam) setCurrentPage(parseInt(pageParam));
    if (sortParam) setActiveFilters((prev) => ({ ...prev, sort: sortParam }));
    if (minPriceParam)
      setActiveFilters((prev) => ({
        ...prev,
        minPrice: parseInt(minPriceParam),
      }));
    if (maxPriceParam)
      setActiveFilters((prev) => ({
        ...prev,
        maxPrice: parseInt(maxPriceParam),
      }));
  }, [searchParams]);

  // Fetch data when slug or filters change
  useEffect(() => {
    if (slug) {
        //eslint-disable-next-line
      fetchCategoryData();
    } else {
      setLoading(false);
    }
  }, [fetchCategoryData, slug]);

  // Update URL when filters change
  const updateURL = useCallback(
    (filters, page) => {
      const params = new URLSearchParams();

      if (page && page > 1) params.set("page", page);
      if (filters.sort && filters.sort !== "newest")
        params.set("sort", filters.sort);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

      const queryString = params.toString();
      const newUrl = queryString
        ? `/categories/${slug}?${queryString}`
        : `/categories/${slug}`;

      router.replace(newUrl, { scroll: false });
    },
    [router, slug],
  );

  const handleSortChange = (sortValue) => {
    const newFilters = { ...activeFilters, sort: sortValue };
    setActiveFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters, 1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateURL(activeFilters, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
    { value: "name_desc", label: "Name: Z to A" },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-1 md:px-4 py-6 md:py-8">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <ProductShimmer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-1 md:px-4 py-6 md:py-8">
        {/* Back Button & Category Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[#3A393D] hover:text-[#559F34] transition-colors text-sm md:text-base mb-3"
          >
            <FaArrowLeft /> Back
          </button>

          <div className="">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-center text-[#3A393D]">
                {category?.name || "Category Products"}
              </h1>
              {category?.bengaliName && (
                <p className="text-sm text-center text-gray-500">{category.bengaliName}</p>
              )}
              <p className="text-gray-600 text-center text-sm md:text-base mt-1">
                Total {totalProducts} products found
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <FaSort className="text-[#559F34]" />
            <select
              value={activeFilters.sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-2 md:px-3 py-1 md:py-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#559F34] focus:border-transparent text-sm text-[#3A393D]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">Error: {error}</p>
            <button
              onClick={() => fetchCategoryData()}
              className="mt-4 px-4 py-2 bg-[#559F34] text-white rounded-lg hover:bg-[#45802A] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && products.length === 0 && !error ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No products found in this category
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 md:gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-base border rounded-lg text-[#3A393D] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Previous
                </button>

                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
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
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-2 md:px-4 py-1 md:py-2 text-xs md:text-base rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#559F34] text-white font-bold"
                          : "text-[#3A393D] hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-base border rounded-lg text-[#3A393D] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsClient;