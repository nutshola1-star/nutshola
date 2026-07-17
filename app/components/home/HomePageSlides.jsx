// components/home/HomePageSlides.js
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const HomePageSlides = () => {
  const [slides, setSlides] = useState([]);
  const [fixedRight1, setFixedRight1] = useState(null);
  const [fixedRight2, setFixedRight2] = useState(null);
  const [mainSlides, setMainSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch slides from the API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch("/api/slide-show/active");
        const data = await res.json();
        if (data.success && data.slides.length > 0) {
          // Separate slides by type
          const main = data.slides.filter(s => s.type === 'main' || !s.type);
          const right1 = data.slides.find(s => s.type === 'fixed-right-1');
          const right2 = data.slides.find(s => s.type === 'fixed-right-2');
          
          setMainSlides(main);
          setFixedRight1(right1 || null);
          setFixedRight2(right2 || null);
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

  // Handle slide transitions for main slides only
  const nextSlide = useCallback(() => {
    if (isTransitioning || mainSlides.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      const next = (prev + 1) % mainSlides.length;
      return next;
    });
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  }, [mainSlides.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || mainSlides.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      const next = (prev - 1 + mainSlides.length) % mainSlides.length;
      return next;
    });
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  }, [mainSlides.length, isTransitioning]);

  // Auto-play interval for main slides only
  useEffect(() => {
    if (mainSlides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [mainSlides.length, nextSlide]);

  // Helper to safely extract image URL
  const getImageUrl = (slide) => {
    if (!slide) return "/placeholder.jpg";
    return slide.image?.url || slide.image || "/placeholder.jpg";
  };

  // Helper to render clickable image
  const renderSlideImage = (slide, className = "", key = "") => {
    if (!slide) return null;
    
    const imageElement = (
      <div key={key} className={`absolute inset-0 ${className}`}>
        <Image
          src={getImageUrl(slide)}
          alt="Slide"
          fill
          priority={key.includes('main')}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 66vw"
        />
      </div>
    );

    // If link exists and is not empty, wrap in Link
    if (slide?.link && slide.link.trim() !== "") {
      return (
        <Link href={slide.link} target="_blank" rel="noopener noreferrer">
          {imageElement}
        </Link>
      );
    }

    // Otherwise return just the image (no link)
    return imageElement;
  };

  if (loading) {
    return <SlideShimmer />;
  }

  if (mainSlides.length === 0 && !fixedRight1 && !fixedRight2) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 md:py-6">
      {/* Custom CSS for the fade effect */}
      <style jsx>{`
        .slide-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .slide-image {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .slide-image.active {
          opacity: 1;
        }

        .slide-image.fade-out {
          opacity: 0;
        }

        .slide-image img {
          transition: transform 0.8s ease-in-out;
        }

        .slide-image.active img {
          transform: scale(1);
        }

        .slide-image.fade-out img {
          transform: scale(1.05);
        }

        @keyframes imageFadeIn {
          0% {
            opacity: 0;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .slide-enter {
          animation: imageFadeIn 0.8s ease-out forwards;
        }

        @keyframes imageFadeOut {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.05);
          }
        }

        .slide-exit {
          animation: imageFadeOut 0.8s ease-in forwards;
        }

        .fixed-image-container {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .fixed-image-container img {
          transition: transform 0.7s ease-in-out;
        }

        .fixed-image-container:hover img {
          transform: scale(1.05);
        }
      `}</style>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 h-auto md:h-[450px] lg:h-[500px]">
        
        {/* === MAIN LARGE SLIDE === */}
        <div className="relative md:col-span-2 h-[150px] md:h-full rounded-xl overflow-hidden group bg-gray-100">
          {mainSlides.length > 0 ? (
            <div className="slide-container">
              {/* Render all slides but only show the active one */}
              {mainSlides.map((slide, index) => {
                const isActive = index === currentIndex;
                const prevIndex = (currentIndex - 1 + mainSlides.length) % mainSlides.length;
                const isPrev = index === prevIndex && isTransitioning;
                
                let slideClass = "slide-image";
                if (isActive) {
                  slideClass += " active slide-enter";
                } else if (isPrev && isTransitioning) {
                  slideClass += " fade-out slide-exit";
                } else {
                  slideClass += " inactive";
                }

                return (
                  <div 
                    key={`slide-${index}`} 
                    className={slideClass}
                    style={{ 
                      opacity: isActive ? 1 : 0,
                      zIndex: isActive ? 2 : 1,
                      pointerEvents: isActive ? 'auto' : 'none',
                    }}
                  >
                    <Image
                      src={getImageUrl(slide)}
                      alt={`Slide ${index + 1}`}
                      fill
                      priority={index === 0}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 66vw"
                    />
                  </div>
                );
              })}

              {/* Navigation Arrows */}
              {mainSlides.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                    disabled={isTransitioning}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10 disabled:opacity-40"
                    aria-label="Previous slide"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                    disabled={isTransitioning}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10 disabled:opacity-40"
                    aria-label="Next slide"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </>
              )}

              {/* Pagination Dots */}
              {mainSlides.length > 1 && (
                <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                  {mainSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (idx !== currentIndex && !isTransitioning) {
                          setIsTransitioning(true);
                          setCurrentIndex(idx);
                          setTimeout(() => {
                            setIsTransitioning(false);
                          }, 600);
                        }
                      }}
                      className={`transition-all duration-300 rounded-full ${
                        currentIndex === idx 
                          ? "bg-[#559F34] w-6 md:w-8 h-2" 
                          : "bg-white/70 hover:bg-white w-2 h-2"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              No main slides available
            </div>
          )}
        </div>

        {/* === FIXED RIGHT IMAGES === */}
        <div className="grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-3 md:gap-4 md:col-span-1 h-[80px] md:h-full">
          
          {/* Fixed Right 1 */}
          <div className="relative rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow bg-gray-100">
            {fixedRight1 ? (
              <>
                {fixedRight1.link && fixedRight1.link.trim() !== "" ? (
                  <Link href={fixedRight1.link} target="_blank" rel="noopener noreferrer" className="fixed-image-container block">
                    <Image
                      src={getImageUrl(fixedRight1)}
                      alt="Fixed Right 1"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </Link>
                ) : (
                  <div className="fixed-image-container">
                    <Image
                      src={getImageUrl(fixedRight1)}
                      alt="Fixed Right 1"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs md:text-sm">
                Fixed Right 1
              </div>
            )}
          </div>

          {/* Fixed Right 2 */}
          <div className="relative rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow bg-gray-100">
            {fixedRight2 ? (
              <>
                {fixedRight2.link && fixedRight2.link.trim() !== "" ? (
                  <Link href={fixedRight2.link} target="_blank" rel="noopener noreferrer" className="fixed-image-container block">
                    <Image
                      src={getImageUrl(fixedRight2)}
                      alt="Fixed Right 2"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </Link>
                ) : (
                  <div className="fixed-image-container">
                    <Image
                      src={getImageUrl(fixedRight2)}
                      alt="Fixed Right 2"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs md:text-sm">
                Fixed Right 2
              </div>
            )}
          </div>
          
        </div>
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