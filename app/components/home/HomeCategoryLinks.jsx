"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const HomeCategoryLinks = () => {
  // Categories state
  const [categories, setCategories] = useState([]);
  const [catfetchLoading, setCatFetchLoading] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Ref for the scrolling container
  const scrollContainerRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);

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

  // Auto-scroll functionality
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || categories.length === 0 || !isAutoScrolling) return;

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        if (!container || isHovered) return;

        // Check if we've reached the end
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        if (container.scrollLeft >= maxScrollLeft - 1) {
          // Reset to start with smooth transition
          container.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        } else {
          // Scroll right by one item width (adjust speed)
          const scrollAmount = container.clientWidth / 3; // Scroll by 1/3 of container width
          container.scrollTo({
            left: container.scrollLeft + scrollAmount,
            behavior: "smooth",
          });
        }
      }, 3000); // Scroll every 3 seconds
    };

    // Start auto-scroll after a small delay
    const timeoutId = setTimeout(startAutoScroll, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [categories, isAutoScrolling, isHovered]);

  // Pause auto-scroll on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Touch/scroll handling - pause auto-scroll when user interacts
  const handleTouchStart = () => {
    setIsAutoScrolling(false);
  };

  const handleTouchEnd = () => {
    // Resume auto-scroll after 5 seconds of inactivity
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 5000);
  };

  // Scroll handler functions
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth / 2;
      const currentScroll = container.scrollLeft;

      // Pause auto-scroll when user manually scrolls
      setIsAutoScrolling(false);
      setTimeout(() => {
        setIsAutoScrolling(true);
      }, 5000);

      container.scrollTo({
        left:
          direction === "left"
            ? currentScroll - scrollAmount
            : currentScroll + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-6 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-4 sm:mb-8">
          <div>
            {/* Sub-heading */}
            <div className="flex items-center gap-1.5 text-[#559F34] font-bold text-[10px] sm:text-xs uppercase tracking-wider mb-1 sm:mb-2">
              <span className="flex gap-0.5">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#559F34]"></span>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#559F34]"></span>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#559F34]"></span>
              </span>
              Fresh From Our Shop
            </div>

            {/* Main Heading */}
            <h2 className="text-xl sm:text-3xl md:text-4xl font-roboto font-bold text-[#3A393D]">
              Shop by Category
            </h2>
          </div>

          {/* Navigation Arrows - Hidden on small screens */}
          <div className="hidden sm:flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              aria-label="Scroll left"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-[#559F34] hover:bg-[#7ECB2A] flex items-center justify-center text-white shadow-md transition-colors"
              aria-label="Scroll right"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Categories Carousel */}
        {catfetchLoading ? (
          /* Loading Shimmer with responsive sizing */
          <div className="flex gap-2 sm:gap-6 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center shrink-0 w-[calc(50%-4px)] sm:w-36 md:w-48"
              >
                <div className="w-[calc(100%-4px)] aspect-square sm:w-32 sm:h-32 md:w-44 md:h-44 rounded-full bg-gray-100 animate-pulse"></div>
                <div className="w-16 sm:w-24 h-6 sm:h-8 bg-gray-200 rounded-full mt-[-12px] sm:mt-[-16px] animate-pulse relative z-10"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Actual Data */
          <div
            className="relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={scrollContainerRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="flex gap-2 sm:gap-6 overflow-x-auto pb-4 sm:pb-6 pt-1 sm:pt-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory"
            >
              {/* Duplicate categories for infinite scroll effect */}
              {[...categories, ...categories, ...categories].map(
                (category, index) => (
                  <Link
                    href={`/categories/${category.slug}`}
                    key={`${category._id}-${index}`}
                    className="flex flex-col items-center shrink-0 group/card w-[calc(33.333%-4px)] sm:w-36 md:w-48 cursor-pointer snap-start transition-transform duration-300 hover:scale-105"
                  >
                    {/* Circular Image Background - Smaller on mobile */}
                    <div className="relative w-[calc(100%-4px)] aspect-square sm:w-32 sm:h-32 md:w-44 md:h-44 rounded-full bg-[#f8f9f8] flex items-center justify-center p-2 sm:p-4 transition-all duration-300 group-hover/card:shadow-lg">
                      {category.image?.url && (
                        <Image
                          src={category.image.url}
                          alt={category.name}
                          fill
                          className="object-contain p-1 sm:p-4 drop-shadow-sm transition-transform duration-300 group-hover/card:scale-110"
                          sizes="(max-width: 640px) 30vw, (max-width: 768px) 128px, 176px"
                        />
                      )}
                    </div>

                    {/* Overlapping Category Button - Smaller on mobile */}
                    <div className="relative z-10 mt-[-10px] sm:mt-[-18px] md:mt-[-20px]">
                      <span
                        style={{ fontFamily: "Roboto, sans-serif" }}
                        className="inline-block px-2 sm:px-5 py-1 sm:py-2 bg-[#559F34] text-white rounded-full text-[11px] sm:text-[14px] font-semibold shadow-md group-hover/card:bg-[#7ECB2A] transition-colors duration-300 whitespace-nowrap"
                      >
                        {category.name}
                        {category.bengaliName && (
                          <span className="hidden sm:inline">
                            {" "}
                            ({category.bengaliName})
                          </span>
                        )}
                      </span>
                    </div>
                  </Link>
                ),
              )}
            </div>

            {/* Mobile scroll hint - smaller */}
            <div className="text-center mt-1 sm:hidden">
              <span className="text-[10px] text-gray-400">← Swipe →</span>
            </div>

            {/* Pause indicator on hover */}
            {isHovered && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                ⏸ Paused
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeCategoryLinks;
