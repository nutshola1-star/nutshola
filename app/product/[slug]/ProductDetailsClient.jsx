// app/product/[slug]/ProductDetailsClient.jsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaShoppingCart,
  FaMinus,
  FaPlus,
  FaExpand,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
  FaWeightHanging,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

// Fullscreen Image Viewer Component
const FullscreenImageViewer = ({
  images,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const [imgIndex, setImgIndex] = useState(currentIndex);

  useEffect(() => {
    //eslint-disable-next-line
    setImgIndex(currentIndex);
  }, [currentIndex]);

  const goPrev = () => {
    const newIndex = imgIndex === 0 ? images.length - 1 : imgIndex - 1;
    setImgIndex(newIndex);
    onNavigate(newIndex);
  };

  const goNext = () => {
    const newIndex = imgIndex === images.length - 1 ? 0 : imgIndex + 1;
    setImgIndex(newIndex);
    onNavigate(newIndex);
  };

  return (
    <div className="fixed inset-0 z-[61] bg-black/95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-[#559F34] hover:text-white transition-colors z-10"
      >
        <FaTimes size={24} />
      </button>

      <button
        onClick={goPrev}
        className="absolute left-4 text-white bg-black/50 p-3 rounded-full hover:bg-[#559F34] hover:text-white transition-colors"
      >
        <FaChevronLeft size={24} />
      </button>

      <div className="relative w-full max-w-6xl h-[80vh] mx-4">
        <Image
          src={images[imgIndex]?.url}
          alt={`Product view ${imgIndex + 1}`}
          fill
          className="object-contain"
          priority
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {imgIndex + 1} / {images.length}
        </div>
      </div>

      <button
        onClick={goNext}
        className="absolute right-4 text-white bg-black/50 p-3 rounded-full hover:bg-[#559F34] hover:text-white transition-colors"
      >
        <FaChevronRight size={24} />
      </button>
    </div>
  );
};

// Loading Shimmer
const ProductShimmer = () => (
  <div className="min-h-screen bg-gray-50 py-4 md:py-12 px-3 md:px-4">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
        <div className="lg:w-1/2">
          <div className="bg-gray-200 rounded-xl md:rounded-2xl aspect-square animate-pulse"></div>
          <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-14 h-14 md:w-20 md:h-20 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="lg:w-1/2 space-y-3 md:space-y-4">
          <div className="h-6 md:h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-3 md:h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-8 md:h-12 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-20 md:h-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 md:h-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

// Similar Products Component - Scrollable
const SimilarProducts = ({ products, categorySlug, categoryName }) => {
  const scrollContainerRef = useRef(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth / 2;
      container.scrollTo({
        left: direction === "left" 
          ? container.scrollLeft - scrollAmount 
          : container.scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-base md:text-2xl font-bold text-[#3A393D]">
          Similar Products
        </h2>
        {categorySlug && (
          <Link
            href={`/categories/${categorySlug}`}
            className="text-xs md:text-sm text-[#559F34] hover:underline font-medium"
          >
            View All →
          </Link>
        )}
      </div>

      <div className="relative group">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 md:p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2"
        >
          <FaChevronLeft size={16} className="md:text-xl" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {products.slice(0, 8).map((related) => (
            <Link
              href={`/product/${related.slug}`}
              key={related._id}
              className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] group bg-white rounded-lg md:rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              onClick={() => {
                sessionStorage.setItem("productReturnUrl", window.location.pathname);
              }}
            >
              <div className="relative aspect-square bg-gray-100">
                {related.photos?.[0] && (
                  <Image
                    src={related.photos[0].url}
                    alt={related.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, 200px"
                  />
                )}
              </div>
              <div className="p-2 md:p-3">
                <h3 className="text-[10px] md:text-sm font-semibold text-[#3A393D] line-clamp-2 group-hover:text-[#559F34] transition-colors">
                  {related.name}
                </h3>
                {related.pricing && related.pricing.length > 0 && (
                  <p className="text-xs md:text-base font-bold text-[#559F34] mt-0.5 md:mt-1">
                    ৳{Math.min(...related.pricing.map(p => p.price))}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 md:p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2"
        >
          <FaChevronRight size={16} className="md:text-xl" />
        </button>
      </div>
    </div>
  );
};

// Main Product Details Component
const ProductDetailsClient = ({ slug }) => {
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [backUrl, setBackUrl] = useState("/all-products");

  const THUMBNAILS_TO_SHOW = 4;

  // Get the return URL from session storage
  useEffect(() => {
    const storedUrl = sessionStorage.getItem("productReturnUrl");
    if (storedUrl) {
        //eslint-disable-next-line
      setBackUrl(storedUrl);
    }
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/product/slug/${slug}`);
        const data = await res.json();

        if (data?.product) {
          setProduct(data.product);
          if (data.product.photos?.[0]?.url) {
            setSelectedImage(data.product.photos[0].url);
          }
          
          // Fetch similar products using the product API with category slug
          if (data.product._id && data.product.category?.slug) {
            try {
              const similarRes = await fetch(
                `/api/product/client?limit=8&category=${data.product.category.slug}&sort=newest`
              );
              const similarData = await similarRes.json();
              if (similarData.success) {
                // Filter out the current product
                const filtered = similarData.products.filter(
                  (p) => p._id !== data.product._id
                );
                setSimilarProducts(filtered);
              }
            } catch (error) {
              console.error("Error fetching similar products:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Format weight display
  const formatWeight = (weight, unit) => {
    if (weight >= 1000 && unit === "g") {
      return `${weight / 1000}kg`;
    }
    return `${weight}${unit}`;
  };

  // Get current pricing
  const currentPricing = product?.pricing?.[selectedVariant];
  const hasDiscount = currentPricing?.discountedPrice !== null && 
    currentPricing?.discountedPrice < currentPricing?.price;
  const displayPrice = hasDiscount ? currentPricing?.discountedPrice : currentPricing?.price;
  const originalPrice = currentPricing?.price;

  // Calculate discount percentage
  const discountPercent = originalPrice && displayPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  // Thumbnail navigation
  const visibleThumbnails = product?.photos
    ? product.photos.slice(
        thumbnailStartIndex,
        thumbnailStartIndex + THUMBNAILS_TO_SHOW
      )
    : [];

  const handlePrevThumbnails = () => {
    if (thumbnailStartIndex > 0) {
      setThumbnailStartIndex(thumbnailStartIndex - 1);
    }
  };

  const handleNextThumbnails = () => {
    if (thumbnailStartIndex + THUMBNAILS_TO_SHOW < product?.photos?.length) {
      setThumbnailStartIndex(thumbnailStartIndex + 1);
    }
  };

  // Handle image selection
  const handleImageClick = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleFullscreenNavigate = (newIndex) => {
    setCurrentImageIndex(newIndex);
  };

  // Quantity handlers
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (product && quantity < 99) setQuantity(quantity + 1);
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product || !currentPricing) return;

    setAddingToCart(true);

    const weightString = formatWeight(currentPricing.weight, currentPricing.unit);
    
    let weightInGrams = currentPricing.weight;
    if (currentPricing.unit === "kg") {
      weightInGrams = currentPricing.weight * 1000;
    } else if (currentPricing.unit === "g") {
      weightInGrams = currentPricing.weight;
    } else if (currentPricing.unit === "piece" || currentPricing.unit === "pack") {
      weightInGrams = 100;
    }

    const cartItem = {
      ...product,
      _id: `${product._id}-${currentPricing.weight}${currentPricing.unit}`,
      name: `${product.name} - ${weightString}`,
      sellingPrice: displayPrice,
      originalPrice: originalPrice,
      quantity: 99,
      weight: weightString,
      weightInGrams: weightInGrams,
      selectedVariant: selectedVariant,
    };

    addToCart(cartItem, quantity);
    toast.success(`Added ${quantity} x ${product.name} to cart!`);
    setAddingToCart(false);
  };

  // Go back to previous page
  const goBack = () => {
    router.push(backUrl);
  };

  if (loading) {
    return <ProductShimmer />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-[#3A393D] mb-4">Product Not Found</h2>
          <Link href="/all-products" className="text-[#559F34] hover:underline font-semibold text-sm md:text-base">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.quantity === 0;

  return (
    <>
      {/* Fullscreen Viewer */}
      {isFullscreen && product?.photos && (
        <FullscreenImageViewer
          images={product.photos}
          currentIndex={currentImageIndex}
          onClose={closeFullscreen}
          onNavigate={handleFullscreenNavigate}
        />
      )}

      <div className="min-h-screen bg-gray-50 py-3 md:py-8 px-3 md:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 md:gap-2 text-[#3A393D] hover:text-[#559F34] transition-colors mb-3 md:mb-6 text-xs md:text-base"
          >
            <FaArrowLeft size={12} className="md:text-base" /> Back
          </button>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-10">
            {/* Left Column - Images */}
            <div className="lg:w-1/2">
              {/* Main Image */}
              <div
                className="relative bg-white rounded-lg md:rounded-xl overflow-hidden cursor-pointer group shadow-md"
                onClick={openFullscreen}
              >
                <div className="relative w-full pt-[100%]">
                  {selectedImage && (
                    <Image
                      src={selectedImage}
                      alt={product.name}
                      fill
                      className="object-contain p-2 md:p-4"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                </div>
                <button
                  className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-white/90 p-1.5 md:p-2 rounded-full text-[#3A393D] hover:bg-[#559F34] hover:text-white transition-colors shadow-md z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFullscreen();
                  }}
                >
                  <FaExpand size={12} className="md:text-base" />
                </button>
              </div>

              {/* Thumbnails */}
              {product.photos && product.photos.length > 1 && (
                <div className="mt-3 md:mt-4 flex items-center gap-1.5 md:gap-2">
                  {thumbnailStartIndex > 0 && (
                    <button
                      onClick={handlePrevThumbnails}
                      className="p-1.5 md:p-2 bg-white rounded-full text-[#3A393D] hover:bg-[#559F34] hover:text-white transition-colors shadow-md flex-shrink-0"
                    >
                      <FaChevronLeft size={10} className="md:text-sm" />
                    </button>
                  )}

                  <div className="flex gap-1.5 md:gap-2 overflow-hidden flex-1">
                    {visibleThumbnails.map((img, idx) => {
                      const actualIndex = thumbnailStartIndex + idx;
                      return (
                        <div
                          key={actualIndex}
                          className={`relative w-14 h-14 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer transition-all flex-shrink-0 ${
                            selectedImage === img.url
                              ? "ring-2 ring-[#559F34] scale-105"
                              : "ring-1 ring-gray-200 hover:ring-[#559F34]/50"
                          }`}
                          onClick={() => handleImageClick(img.url, actualIndex)}
                        >
                          <Image
                            src={img.url}
                            alt={`Thumbnail ${actualIndex + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {thumbnailStartIndex + THUMBNAILS_TO_SHOW < product.photos.length && (
                    <button
                      onClick={handleNextThumbnails}
                      className="p-1.5 md:p-2 bg-white rounded-full text-[#3A393D] hover:bg-[#559F34] hover:text-white transition-colors shadow-md flex-shrink-0"
                    >
                      <FaChevronRight size={10} className="md:text-sm" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Product Details */}
            <div className="lg:w-1/2">
              {/* Product Title */}
              <h1 className="text-lg md:text-3xl font-bold text-[#3A393D] mb-1 md:mb-2">
                {product.name}
              </h1>

              {/* SKU & Category */}
              <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-1 text-[10px] md:text-sm text-gray-500 mb-3 md:mb-4">
                {product.SKU && <span>SKU: {product.SKU}</span>}
                {product.category && (
                  <span>
                    Category: 
                    <Link
                      href={`/categories/${product.category.slug}`}
                      className="text-[#559F34] hover:underline ml-0.5 md:ml-1"
                    >
                      {product.category.name}
                    </Link>
                  </span>
                )}
              </div>

              {/* Weight Selection */}
              {product.pricing && product.pricing.length > 0 && (
                <div className="mb-3 md:mb-4">
                  <label className="block text-xs md:text-sm font-medium text-[#3A393D] mb-1.5 md:mb-2">
                    Select Weight
                  </label>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {product.pricing.map((pricing, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedVariant(index);
                          setQuantity(1);
                        }}
                        className={`px-2.5 py-1 md:px-4 md:py-2 rounded-lg border-2 transition-all text-[10px] md:text-sm flex items-center gap-1 md:gap-1.5 ${
                          selectedVariant === index
                            ? "border-[#559F34] bg-[#559F34]/10 text-[#559F34] font-semibold"
                            : "border-gray-200 hover:border-[#559F34] text-[#3A393D]"
                        }`}
                      >
                        <FaWeightHanging size={10} className="md:text-xs" />
                        {formatWeight(pricing.weight, pricing.unit)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Section */}
              {currentPricing && (
                <div className="mb-4 md:mb-6">
                  <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                    <span className="text-xl md:text-3xl font-bold text-[#559F34]">
                      ৳{displayPrice?.toFixed(2)}
                    </span>
                    {hasDiscount && originalPrice && (
                      <>
                        <span className="text-gray-400 line-through text-sm md:text-lg">
                          ৳{originalPrice?.toFixed(2)}
                        </span>
                        <span className="bg-red-500 text-white text-[10px] md:text-sm px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full">
                          -{discountPercent}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-4 md:mb-6">
                <label className="block text-xs md:text-sm font-medium text-[#3A393D] mb-1.5 md:mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex items-center bg-white rounded-full shadow-md">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="p-1.5 md:p-3 text-gray-500 disabled:opacity-50 hover:bg-[#559F34] hover:text-white rounded-l-full transition-colors"
                    >
                      <FaMinus size={10} className="md:text-xs" />
                    </button>
                    <span className="w-8 md:w-10 text-center font-semibold text-[#3A393D] text-sm md:text-base">
                      {quantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      disabled={isOutOfStock}
                      className="p-1.5 md:p-3 text-gray-500 disabled:opacity-50 hover:bg-[#559F34] hover:text-white rounded-r-full transition-colors"
                    >
                      <FaPlus size={10} className="md:text-xs" />
                    </button>
                  </div>
                  <span className="text-[10px] md:text-sm text-gray-500">
                    {isOutOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-4 md:mb-6">
                {!isOutOfStock && (
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 py-2 md:py-3 px-4 md:px-6 rounded-full font-semibold text-xs md:text-sm bg-[#559F34] text-white hover:bg-[#45802A] transition-all disabled:opacity-70 flex items-center justify-center gap-1.5 md:gap-2"
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <FaShoppingCart size={12} className="md:text-sm" /> Add to Cart
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Product Description */}
              {product.description && (
                <div className="border-t border-gray-200 pt-4 md:pt-6">
                  <h3 className="text-sm md:text-lg font-semibold text-[#3A393D] mb-2 md:mb-3">
                    Product Details
                  </h3>
                  <div
                    className="text-gray-600 text-[11px] md:text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Similar Products Section */}
          <SimilarProducts 
            products={similarProducts} 
            categorySlug={product?.category?.slug}
            categoryName={product?.category?.name}
          />
        </div>
      </div>
    </>
  );
};

export default ProductDetailsClient;