"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

const LatestProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  // Track selected variant for each product
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch("/api/product/client?limit=5&sort=newest");
        const data = await response.json();
        if (data.success) {
          setProducts(data.products || []);
          // Initialize selected variants to 0 for each product
          const initialVariants = {};
          data.products.forEach(product => {
            initialVariants[product._id] = 0;
          });
          setSelectedVariants(initialVariants);
        }
      } catch (error) {
        console.error("Error fetching latest products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  // Format weight display
  const formatWeight = (weight, unit) => {
    if (weight >= 1000 && unit === "g") {
      return `${weight / 1000}kg`;
    }
    return `${weight}${unit}`;
  };

  // Get display price for a specific variant
  const getVariantPrice = (pricing, variantIndex) => {
    if (!pricing || pricing.length === 0 || variantIndex >= pricing.length) return null;
    const activePricing = pricing[variantIndex];
    const hasDiscount = activePricing.discountedPrice !== null && 
                        activePricing.discountedPrice < activePricing.price;
    return {
      price: hasDiscount ? activePricing.discountedPrice : activePricing.price,
      originalPrice: activePricing.price,
      hasDiscount,
      weight: formatWeight(activePricing.weight, activePricing.unit),
      weightInGrams: activePricing.weight,
      unit: activePricing.unit,
    };
  };

  // Handle variant selection
  const handleVariantSelect = (e, productId, variantIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantIndex
    }));
  };

  // Handle Add to Cart
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.pricing || product.pricing.length === 0) return;

    const selectedVariant = selectedVariants[product._id] || 0;
    const activePricing = product.pricing[selectedVariant];
    const hasDiscount =
      activePricing.discountedPrice !== null &&
      activePricing.discountedPrice < activePricing.price;
    const currentPrice = hasDiscount
      ? activePricing.discountedPrice
      : activePricing.price;
    const weightString = formatWeight(activePricing.weight, activePricing.unit);

    // Calculate weight in grams
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

  if (loading) {
    return (
      <div className="py-8 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-[#3A393D]">
                Latest Products
              </h2>
              <p className="text-gray-500 text-sm mt-1">Check out our newest arrivals</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <div className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-[#3A393D]">
              Latest Products
            </h2>
            <p className="text-gray-500 text-sm mt-1">Check out our newest arrivals</p>
          </div>
          <Link 
            href="/all-products" 
            className="text-[#559F34] hover:text-[#7ECB2A] font-semibold text-sm flex items-center gap-1 group"
          >
            View All
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
          {products.map((product) => {
            const selectedVariant = selectedVariants[product._id] || 0;
            const priceInfo = getVariantPrice(product.pricing, selectedVariant);
            
            return (
              <div 
                key={product._id} 
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col h-full"
              >
                {/* Product Image - Clickable to product page */}
                <Link href={`/product/${product.slug}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.photos?.[0] ? (
                      <Image
                        src={product.photos[0].url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {priceInfo?.hasDiscount && (
                      <div className="absolute top-2 left-2 bg-[#559F34] text-white text-[8px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full shadow-md">
                        {Math.round(
                          ((priceInfo.originalPrice - priceInfo.price) / priceInfo.originalPrice) * 100
                        )}% OFF
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-2 md:p-3 flex-1 flex flex-col">
                  <Link href={`/product/${product.slug}`} className="block">
                    <h3 className="text-xs md:text-sm font-semibold text-[#3A393D] line-clamp-2 group-hover:text-[#559F34] transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="mt-1 flex items-center gap-1 md:gap-2">
                      {priceInfo?.hasDiscount && (
                        <span className="text-[10px] md:text-xs text-gray-400 line-through">
                          ৳{priceInfo.originalPrice}
                        </span>
                      )}
                      <span className="text-sm md:text-base font-bold text-[#559F34]">
                        ৳{priceInfo?.price || "N/A"}
                      </span>
                    </div>
                  </Link>

                  {/* Weight Selection Buttons */}
                  {product.pricing && product.pricing.length > 1 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-2 mb-2">
                      {product.pricing.map((pricing, index) => (
                        <button
                          key={index}
                          onClick={(e) => handleVariantSelect(e, product._id, index)}
                          className={`px-1.5 md:px-2.5 py-0.5 md:py-1 text-[8px] md:text-xs font-medium rounded border transition-all ${
                            selectedVariant === index
                              ? "border-black text-black bg-[#d2ffa1] shadow-sm"
                              : "border-gray-200 text-gray-500 hover:border-gray-400"
                          }`}
                        >
                          {formatWeight(pricing.weight, pricing.unit)}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full mt-auto bg-[#559F34] text-white font-bold py-1.5 md:py-2 rounded hover:bg-[#45802A] transition-colors uppercase text-[10px] md:text-xs"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            );
          })}

          {/* See All Card */}
          <Link
            href="/all-products"
            className="group bg-gradient-to-br from-[#559F34]/10 to-[#7ECB2A]/10 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-dashed border-[#559F34]/30 flex flex-col items-center justify-center p-4 md:p-6 min-h-[180px] md:min-h-[220px]"
          >
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#559F34]/20 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-[#559F34]/30 transition-colors">
                <FaArrowRight className="text-2xl md:text-3xl text-[#559F34] group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-base md:text-xl font-bold text-[#3A393D] group-hover:text-[#559F34] transition-colors">
                See All
              </h3>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                View all products
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LatestProducts;