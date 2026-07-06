// app/search/SearchResultsClient.jsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { FaSearch, FaSort, FaTimes, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

// Product Card Component (same as before)
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
                  100,
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

// Main Search Results Component
const SearchResultsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");

  const itemsPerPage = 20;

  // Fetch search results
  const fetchSearchResults = useCallback(async () => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url = `/api/search?q=${encodeURIComponent(query)}&page=${currentPage}&limit=${itemsPerPage}&sort=${sortBy}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalProducts(data.pagination?.totalProducts || 0);
      } else {
        throw new Error(data.message || "Failed to fetch search results");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError(error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, currentPage, sortBy]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (currentPage > 1) params.set("page", currentPage);
    if (sortBy !== "relevance") params.set("sort", sortBy);

    const queryString = params.toString();
    const newUrl = queryString ? `/search?${queryString}` : "/search";
    router.replace(newUrl, { scroll: false });
  }, [query, currentPage, sortBy, router]);

  // Fetch results when query or filters change
  useEffect(() => {
    //eslint-disable-next-line
    fetchSearchResults();
  }, [fetchSearchResults]);

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
    { value: "name_desc", label: "Name: Z to A" },
  ];

  // Show loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <ProductShimmer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-[#3A393D] flex items-center gap-2">
                <FaSearch className="text-[#559F34] text-lg md:text-2xl" />
                Search Results
              </h1>
              {query && (
                <p className="text-gray-500 text-sm md:text-base mt-1">
                  {/* eslint-disable-next-line */}
                  {totalProducts} results for "{query}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sort and Filter Bar */}
        {query && products.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white rounded-lg shadow-sm p-3 md:p-4">
            <div className="flex items-center gap-2">
              <FaSort className="text-[#559F34] text-sm" />
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-2 md:px-3 py-1 md:py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#559F34] text-xs md:text-sm text-[#3A393D]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {products.length} of {totalProducts} products
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">Error: {error}</p>
            <button
              onClick={() => fetchSearchResults()}
              className="mt-4 px-4 py-2 bg-[#559F34] text-white rounded-lg hover:bg-[#45802A] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* No Results State */}
        {!loading && query && products.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <FaSearch className="text-3xl text-gray-300" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#3A393D] mb-2">
              No Results Found
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              {/* eslint-disable-next-line */}
              We {"couldn't"} find any products matching "{query}". Please try
              different keywords or browse our categories.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/all-products"
                className="px-4 py-2 bg-[#559F34] text-white rounded-lg hover:bg-[#45802A] transition-colors"
              >
                Browse All Products
              </Link>
              <Link
                href="/categories"
                className="px-4 py-2 border border-[#559F34] text-[#559F34] rounded-lg hover:bg-[#559F34] hover:text-white transition-colors"
              >
                View Categories
              </Link>
            </div>
          </div>
        )}

        {/* Empty State - No Search Query */}
        {!query && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <FaSearch className="text-3xl text-gray-300" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#3A393D] mb-2">
              Search for Products
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter a search term in the header to find products, categories,
              and more.
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
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

// Loading fallback component
const SearchResultsLoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[#559F34] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-gray-600 font-medium">Searching...</p>
    </div>
  </div>
);

// Main component with Suspense boundary
const SearchResultsClient = () => {
  return (
    <Suspense fallback={<SearchResultsLoadingFallback />}>
      <SearchResultsContent />
    </Suspense>
  );
};

export default SearchResultsClient;
