"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const HomePageSlides = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch active slides from the API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch("/api/slide-show/active");
        const data = await res.json();
        if (data.success && data.slides.length > 0) {
          setSlides(data.slides);
        }
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  // Handle slide transitions
  const nextSlide = useCallback(() => {
    setSlides((prevSlides) => {
      if (prevSlides.length <= 1) return prevSlides;
      setCurrentIndex((prev) => (prev + 1) % prevSlides.length);
      return prevSlides;
    });
  }, []);

  const prevSlide = () => {
    setSlides((prevSlides) => {
      if (prevSlides.length <= 1) return prevSlides;
      setCurrentIndex((prev) => (prev - 1 + prevSlides.length) % prevSlides.length);
      return prevSlides;
    });
  };

  // Auto-play interval
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, [slides.length, nextSlide]);

  // Helper to safely extract image URL
  const getImageUrl = (slide) => {
    if (!slide) return "/placeholder.jpg";
    return slide.image?.url || slide.image || "/placeholder.jpg";
  };

  if (loading) {
    return <SlideShimmer />;
  }

  if (slides.length === 0) {
    return null; // Don't render anything if there are no slides
  }

  // Calculate indices for the 3 positions based on the circulating queue
  const mainIdx = currentIndex;
  const next1Idx = (currentIndex + 1) % slides.length;
  const next2Idx = (currentIndex + 2) % slides.length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 md:py-6">
      {/* Custom CSS for the fade effect.
        Using a key change forces the animation to re-run smoothly.
      */}
      <style jsx>{`
        @keyframes customFade {
          0% { opacity: 0.6; filter: blur(2px); }
          100% { opacity: 1; filter: blur(0px); }
        }
        .fade-anim {
          animation: customFade 0.6s ease-out forwards;
        }
      `}</style>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 h-auto md:h-[450px] lg:h-[500px]">
        
        {/* === MAIN LARGE SLIDE === */}
        <div className="relative md:col-span-2 h-[150px] md:h-full rounded-xl overflow-hidden group">
          {/* Key triggers the fade animation every time mainIdx changes */}
          <div key={`main-${mainIdx}`} className="absolute inset-0 fade-anim">
            <Image
              src={getImageUrl(slides[mainIdx])}
              alt="Main Slide"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          </div>

          {/* Navigation Arrows (Visible on hover on desktop, always on mobile) */}
          {slides.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </>
          )}

          {/* Pagination Dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    mainIdx === idx 
                      ? "bg-[#559F34] w-6 md:w-8 h-2" 
                      : "bg-white/70 hover:bg-white w-2 h-2"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* === SIDE IMAGES (Sub 1 & Sub 2) === */}
        {/* Desktop: Stacked 2 rows / Mobile: Side-by-side 2 cols */}
        {slides.length >= 2 && (
          <div className="grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-3 md:gap-4 md:col-span-1 h-[80px] md:h-full">
            
            {/* Top Right (Desktop) / Bottom Left (Mobile) */}
            <div className="relative rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentIndex(next1Idx)}>
              <div key={`sub1-${next1Idx}`} className="absolute inset-0 fade-anim">
                <Image
                  src={getImageUrl(slides[next1Idx])}
                  alt="Next Slide 1"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            </div>

            {/* Bottom Right (Desktop) / Bottom Right (Mobile) */}
            {slides.length >= 3 && (
              <div className="relative rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentIndex(next2Idx)}>
                <div key={`sub2-${next2Idx}`} className="absolute inset-0 fade-anim">
                  <Image
                    src={getImageUrl(slides[next2Idx])}
                    alt="Next Slide 2"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
};

// Loading Skeleton Component
const SlideShimmer = () => (
  <div className="w-full max-w-7xl mx-auto px-4 py-4 md:py-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 h-[auto] md:h-[450px] lg:h-[500px]">
      <div className="md:col-span-2 h-[220px] sm:h-[300px] md:h-full rounded-xl bg-gray-200 animate-pulse"></div>
      <div className="grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-3 md:gap-4 md:col-span-1 h-[120px] sm:h-[180px] md:h-full">
        <div className="rounded-xl bg-gray-200 animate-pulse"></div>
        <div className="rounded-xl bg-gray-200 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default HomePageSlides;