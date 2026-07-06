// app/categories/CategoriesClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTag } from "react-icons/fa";

const CategoriesClient = () => {
  const [categories, setCategories] = useState([]);
  const [catfetchLoading, setCatFetchLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setCatFetchLoading(true);
      try {
        const response = await fetch("/api/category");
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCatFetchLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Loading shimmer
  if (catfetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Shimmer */}
          <div className="text-center mb-10">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto mt-2"></div>
          </div>

          {/* Grid Shimmer */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <FaTag className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#3A393D] mb-2">
            No Categories Found
          </h2>
          <p className="text-gray-500">
            Categories will appear here once added.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 text-[#559F34] font-semibold text-sm uppercase tracking-wider mb-2">
            <span className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[#559F34]"></span>
              <span className="w-2 h-2 rounded-full bg-[#559F34]"></span>
              <span className="w-2 h-2 rounded-full bg-[#559F34]"></span>
            </span>
            Browse Our Collection
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3A393D]">
            Shop by Category
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
            Explore our wide range of products organized by category
          </p>
          <div className="mt-2 text-sm text-gray-400">
            {categories.length} Categories Available
          </div>
        </div>

        {/* Categories Grid - 4 for laptop, 3 for tablet, 2 for mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              // FIX 1: Added 'h-full' and 'flex flex-col' to handle grid stretching properly
              className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 h-full flex flex-col"
            >
              {/* Category Image */}
              {/* FIX 2: Added 'shrink-0' to prevent the image from squishing in the flex container */}
              <div className="relative w-full aspect-square sm:aspect-square bg-gray-100 overflow-hidden shrink-0">
                {category.image?.url ? (
                  <Image
                    src={category.image.url}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <FaTag className="text-4xl text-gray-300" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>

              {/* Category Name & Button */}
              {/* FIX 3: Added 'flex-1 flex flex-col justify-between' to push content dynamically */}
              <div className="p-3 sm:p-4 text-center flex-1 flex flex-col justify-between items-center">
                <div className="w-full">
                  <h3 className="font-semibold text-[#3A393D] group-hover:text-[#559F34] transition-colors text-xs sm:text-sm md:text-base line-clamp-1">
                    {category.name}
                  </h3>
                  {category.bengaliName && (
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {category.bengaliName}
                    </p>
                  )}
                </div>

                {/* View Products Button */}
                {/* FIX 4: Added 'hidden md:block' so it doesn't take up dead space on mobile */}
                <div className="mt-1.5 sm:mt-2 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-block text-[10px] sm:text-xs font-medium text-[#559F34] border border-[#559F34] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full hover:bg-[#559F34] hover:text-white transition-colors duration-300">
                    View Products →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesClient;
