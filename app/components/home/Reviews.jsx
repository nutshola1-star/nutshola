"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaStar,
  FaStarHalfAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/reviews?active=true");
        const data = await response.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || reviews.length === 0 || !isAutoScrolling) return;

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
          const scrollAmount = container.clientWidth / itemsPerView;
          container.scrollTo({
            left: container.scrollLeft + scrollAmount,
            behavior: "smooth",
          });
        }
      }, 3500); // Scroll every 3.5 seconds
    };

    // Start auto-scroll after a small delay
    const timeoutId = setTimeout(startAutoScroll, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [reviews, isAutoScrolling, isHovered, itemsPerView]);

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

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar
          key={`full-${i}`}
          className="text-yellow-400 text-sm md:text-base"
        />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt
          key="half"
          className="text-yellow-400 text-sm md:text-base"
        />,
      );
    }

    const remaining = 5 - stars.length;
    for (let i = 0; i < remaining; i++) {
      stars.push(
        <FaStar
          key={`empty-${i}`}
          className="text-gray-300 text-sm md:text-base"
        />,
      );
    }

    return stars;
  };

  // Navigation functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth / itemsPerView;

      // Pause auto-scroll when user manually scrolls
      setIsAutoScrolling(false);
      setTimeout(() => {
        setIsAutoScrolling(true);
      }, 5000);

      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth / itemsPerView;

      // Pause auto-scroll when user manually scrolls
      setIsAutoScrolling(false);
      setTimeout(() => {
        setIsAutoScrolling(true);
      }, 5000);

      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#3A393D] mb-8">
            What Our Customers Say
          </h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#559F34]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!reviews.length) {
    return null;
  }

  // Create an array with duplicated reviews for smooth infinite scroll
  const duplicatedReviews = [...reviews, ...reviews, ...reviews];

  return (
    <div className="py-8 md:py-12 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#3A393D] mb-2">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Real reviews from our valued customers
          </p>
        </div>

        <div
          className="relative group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Buttons - Desktop */}
          <button
            onClick={scrollLeft}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-[#559F34] hover:text-white transition-all z-10 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Previous reviews"
          >
            <FaChevronLeft className="text-lg" />
          </button>
          <button
            onClick={scrollRight}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-[#559F34] hover:text-white transition-all z-10 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Next reviews"
          >
            <FaChevronRight className="text-lg" />
          </button>

          {/* Reviews Container - Scrollable */}
          <div
            ref={scrollContainerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex overflow-x-auto scroll-smooth gap-4 md:gap-6 pb-4 hide-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {duplicatedReviews.map((review, index) => (
              <div
                key={`${review._id}-${index}`}
                className="flex-none w-[calc(100%-1rem)] sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1.25rem)] lg:w-[calc(25%-1.25rem)] snap-start"
              >
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 h-full border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  {/* User Icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#559F34] to-[#7ECB2A] flex items-center justify-center text-white text-lg md:text-xl flex-shrink-0">
                      <FaUser />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#3A393D] text-sm md:text-base truncate">
                        {review.reviewerName}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {review.reviewerDistrict}
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {renderStars(review.rating)}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-600 text-sm md:text-base line-clamp-4">
                    {/* eslint-disable-next-line */}
                    "{review.reviewText}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Navigation Buttons */}
          {reviews.length > itemsPerView && (
            <div className="flex justify-center mt-4 gap-3 md:hidden">
              <button
                onClick={scrollLeft}
                className="bg-white shadow-md rounded-full p-2.5 hover:bg-[#559F34] hover:text-white transition-colors border border-gray-200"
                aria-label="Previous reviews"
              >
                <FaChevronLeft className="text-sm" />
              </button>
              <button
                onClick={scrollRight}
                className="bg-white shadow-md rounded-full p-2.5 hover:bg-[#559F34] hover:text-white transition-colors border border-gray-200"
                aria-label="Next reviews"
              >
                <FaChevronRight className="text-sm" />
              </button>
            </div>
          )}

          {/* Pause indicator on hover */}
          {isHovered && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              ⏸ Paused
            </div>
          )}
        </div>

        {/* Scroll Progress Indicator */}
        <div className="mt-6 flex justify-center gap-1">
          {reviews
            .slice(0, Math.ceil(reviews.length / itemsPerView))
            .map((_, index) => (
              <div
                key={index}
                className="h-1.5 rounded-full transition-all duration-300 bg-gray-300 w-6"
              />
            ))}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .snap-start {
          scroll-snap-align: start;
        }
      `}</style>
    </div>
  );
};

export default Reviews;
