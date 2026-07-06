// app/components/Header.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { FaSearch, FaTimes, FaSpinner, FaTag, FaBox, FaList } from "react-icons/fa";
import MobileMenu from "./MobileMenu";
import CartIcon from "../home/CartIcon";
import Logo from "../../assets/logo/TransparentLogo.png";

const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Fetch search suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim() || query.trim().length < 1) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&limit=8`
      );
      const data = await response.json();

      if (data.success) {
        setSuggestions(data.suggestions || []);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim().length >= 1) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 200); // 200ms for smooth character-by-character search
    } else {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, fetchSuggestions]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || !suggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (searchQuery.trim()) {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim() && !isSearching) {
      setIsSearching(true);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setTimeout(() => {
        setSearchQuery("");
        setSuggestions([]);
        setIsSearching(false);
      }, 100);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (item) => {
    if (item.type === 'category' && item.slug) {
      router.push(`/categories/${item.slug}`);
    } else if (item.slug) {
      router.push(`/product/${item.slug}`);
    }
    setShowSuggestions(false);
    setSearchQuery("");
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Get match type badge
  const getMatchTypeBadge = (matchType) => {
    const badges = {
      name: { text: "Product", color: "bg-[#559F34] text-white" },
      sku: { text: "SKU", color: "bg-[#7ECB2A] text-[#3A393D]" },
      description: { text: "Description", color: "bg-[#3A393D] text-white" },
      category: { text: "Category", color: "bg-[#559F34]/20 text-[#559F34]" },
      general: { text: "Match", color: "bg-gray-100 text-gray-700" },
    };
    return badges[matchType] || badges.general;
  };

  // Get type icon
  const getTypeIcon = (type) => {
    if (type === 'category') return <FaList className="text-[#559F34]" />;
    return <FaBox className="text-[#7ECB2A]" />;
  };

  // Categories section
  const [categories, setCategories] = useState([]);
  const [catfetchLoading, setCatFetchLoading] = useState(false);

  const fetchCategories = async () => {
    setCatFetchLoading(true);
    try {
      const response = await fetch("/api/category");
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCatFetchLoading(false);
    }
  };

  useEffect(() => {
    //eslint-disable-next-line
    fetchCategories();
  }, []);

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden px-2 md:px-4 lg:px-8 xl:px-16 2xl:px-32 md:flex items-center justify-between h-20 z-100 overflow-hidden">
        {/* LEFT */}
        <div className="flex items-center p-2 rounded-md">
          <Link href="/" className="flex items-center">
            <Image
              src={Logo}
              alt="logo"
              height={70}
              width={200}
              className="object-contain overflow-hidden"
            />
          </Link>
        </div>

        {/* CENTER - search with suggestions */}
        <div className="flex-1 max-w-xl mx-8" ref={searchRef}>
          <div className="relative">
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="
                  w-full
                  bg-gray-50 
                  text-[#3A393D] 
                  placeholder-gray-300 
                  pl-4 pr-24 py-2.5
                  rounded-full 
                  border-2 border-[#7ECB2A]
                  focus:border-[#559F34] 
                  focus:outline-none 
                  focus:bg-gray-50
                  transition-all 
                  duration-300
              "
              />
              <div className="absolute right-0 top-0 h-full flex items-center">
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="px-2 text-gray-300 hover:text-[#3A393D] transition-colors"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="
                    px-4 
                    h-full
                    flex 
                    items-center 
                    justify-center
                    bg-[#559F34] 
                    text-white 
                    rounded-r-full
                    hover:bg-[#3A393D]
                    transition-colors
                    duration-300
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                "
                >
                  {isSearching ? (
                    <FaSpinner className="text-xl animate-spin" />
                  ) : (
                    <FaSearch className="text-xl" />
                  )}
                </button>
              </div>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-50 max-h-[500px] overflow-y-auto border border-gray-100">
                {isLoadingSuggestions ? (
                  <div className="p-4 text-center text-gray-500">
                    <FaSpinner className="animate-spin inline mr-2 text-[#559F34]" />
                    Loading suggestions...
                  </div>
                ) : (
                  <>
                    {suggestions.map((item, index) => {
                      const matchType = getMatchTypeBadge(item.matchType);
                      const isCategory = item.type === 'category';
                      return (
                        <div
                          key={item._id}
                          onClick={() => handleSuggestionClick(item)}
                          className={`
                            p-3 hover:bg-[#7ECB2A]/10 cursor-pointer transition-colors border-b border-gray-100 last:border-0
                            ${index === selectedIndex ? "bg-[#7ECB2A]/10" : ""}
                          `}
                        >
                          <div className="flex items-start gap-3">
                            {/* Image/Icon */}
                            {!isCategory && item.thumbnail ? (
                              <div className="w-12 h-12 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                  src={item.thumbnail}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : isCategory && item.image ? (
                              <div className="w-12 h-12 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-[#7ECB2A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                {isCategory ? (
                                  <FaList className="text-[#559F34] text-xl" />
                                ) : (
                                  <FaBox className="text-[#7ECB2A] text-xl" />
                                )}
                              </div>
                            )}

                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span
                                  className="text-sm font-medium text-[#3A393D]"
                                  dangerouslySetInnerHTML={{
                                    __html: item.highlightedName || item.name,
                                  }}
                                />
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${matchType.color}`}
                                >
                                  {matchType.text}
                                </span>
                                {isCategory && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#559F34]/10 text-[#559F34] font-medium">
                                    Category
                                  </span>
                                )}
                              </div>
                              
                              {!isCategory ? (
                                <>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    {item.SKU && (
                                      <span className="font-mono">SKU: {item.SKU}</span>
                                    )}
                                    <span className="text-[#559F34] font-semibold">
                                      {item.priceDisplay}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    {item.categoryName}
                                  </div>
                                </>
                              ) : (
                                <div className="text-xs text-gray-500">
                                  {item.bengaliName && (
                                    <span>{item.bengaliName} • </span>
                                  )}
                                  <span>Category</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* View All Results */}
                    {suggestions.length > 0 && (
                      <div
                        onClick={handleSearch}
                        className="p-3 bg-[#7ECB2A]/5 hover:bg-[#7ECB2A]/10 cursor-pointer text-center border-t border-gray-200"
                      >
                        <span className="text-sm text-[#559F34] font-medium">
                          {/* eslint-disable-next-line */}
                          View all results for "{searchQuery}"
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - Icons */}
        <div className="flex items-center space-x-4 text-[#3A393D]">
          <Link
            href="/"
            className="hover:text-[#559F34] text-sm relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#7ECB2A] after:transition-all after:duration-300 hover:after:w-full"
          >
            HOME
          </Link>
          <Link
            href="/all-products"
            className="hover:text-[#559F34] text-sm relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#7ECB2A] after:transition-all after:duration-300 hover:after:w-full"
          >
            PRODUCTS
          </Link>
          <Link
            href="/contact"
            className="hover:text-[#559F34] text-sm relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#7ECB2A] after:transition-all after:duration-300 hover:after:w-full"
          >
            CONTACT
          </Link>
          <CartIcon />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center gap-1 h-15 pr-3">
          <Link href="/" className="flex-shrink-0">
            <Image src={Logo} alt="logo" height={60} width={100} />
          </Link>

          <div className="flex-1" ref={searchRef}>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="
                  w-full
                  bg-white 
                  text-[#3A393D] 
                  text-xs
                  placeholder-gray-300 
                  pl-3 pr-10 py-1.5
                  rounded-full 
                  border-2 border-[#7ECB2A]
                  focus:border-[#559F34] 
                  focus:outline-none 
                  focus:bg-gray-50
                  transition-all 
                  duration-300
              "
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="
                  absolute 
                  right-0 
                  top-0 
                  h-full 
                  px-3 
                  flex 
                  items-center 
                  justify-center
                  bg-[#559F34] 
                  text-white  
                  rounded-r-full
                  hover:bg-[#3A393D]
                  transition-colors
                  duration-300
                  disabled:opacity-50
                  disabled:cursor-not-allowed
              "
              >
                {isSearching ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : (
                  <FaSearch className="text-sm" />
                )}
              </button>
            </div>

            {/* Mobile Suggestions */}
            {showSuggestions && suggestions && suggestions.length > 0 && (
              <div className="absolute left-3 right-3 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto border border-gray-100">
                {isLoadingSuggestions ? (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    <FaSpinner className="animate-spin inline mr-2 text-[#559F34]" />
                    Loading...
                  </div>
                ) : (
                  <>
                    {suggestions.map((item, index) => {
                      const matchType = getMatchTypeBadge(item.matchType);
                      const isCategory = item.type === 'category';
                      return (
                        <div
                          key={item._id}
                          onClick={() => handleSuggestionClick(item)}
                          className={`p-2 hover:bg-[#7ECB2A]/10 cursor-pointer border-b border-gray-100 ${index === selectedIndex ? "bg-[#7ECB2A]/10" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            {!isCategory && item.thumbnail ? (
                              <div className="w-8 h-8 relative flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                <Image
                                  src={item.thumbnail}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : isCategory && item.image ? (
                              <div className="w-8 h-8 relative flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-[#7ECB2A]/10 rounded flex items-center justify-center flex-shrink-0">
                                {isCategory ? (
                                  <FaList className="text-[#559F34] text-xs" />
                                ) : (
                                  <FaBox className="text-[#7ECB2A] text-xs" />
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-[#3A393D] truncate">
                                  {item.name}
                                </span>
                                <span
                                  className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${matchType.color}`}
                                >
                                  {matchType.text}
                                </span>
                              </div>
                              {!isCategory && (
                                <div className="text-xs text-[#559F34] font-semibold">
                                  {item.priceDisplay}
                                </div>
                              )}
                              {isCategory && (
                                <div className="text-xs text-gray-400">
                                  Category
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div
                      onClick={handleSearch}
                      className="p-2 bg-[#7ECB2A]/5 text-center text-xs text-[#559F34] font-medium border-t border-gray-200"
                    >
                      View all results
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 text-[#7ECB2A] text-sm">
            <CartIcon />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileMenu />

      {/* Category Header */}
      <div className="w-full bg-[#7ECB2A] h-7 text-white text-sm font-semibold py-1 hidden md:flex items-center justify-center overflow-x-auto">
        {catfetchLoading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="px-4 py-1 mx-1 relative overflow-hidden rounded"
            >
              <div className="w-16 h-4 bg-white/20 rounded relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </div>
            </div>
          ))
        ) : (
          <>
            <Link
              href="/all-products"
              className="px-4 py-1 hover:bg-white/20 transition-colors whitespace-nowrap rounded"
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="px-4 py-1 hover:bg-white/20 transition-colors whitespace-nowrap rounded"
              >
                {category.name}
              </Link>
            ))}
          </>
        )}
      </div>
    </>
  );
};

export default Header;