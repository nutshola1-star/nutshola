// app/components/layout/MenuButton.jsx
"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { FaBarsProgress } from "react-icons/fa6";
import { usePathname } from "next/navigation";

const MenuButton = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const pathname = usePathname();
  const isUserScrolling = useRef(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuIsOpen(false);
      }
    };

    // Close menu on user scroll only
    const handleScroll = () => {
      if (menuIsOpen) {
        // Check if it's a user-initiated scroll
        if (isUserScrolling.current) {
          setMenuIsOpen(false);
          isUserScrolling.current = false;
        }
      }
    };

    // Track user-initiated scroll events
    const handleUserScroll = () => {
      isUserScrolling.current = true;
    };

    // Close menu on escape key
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);
    document.addEventListener("wheel", handleUserScroll, { passive: true });
    document.addEventListener("touchmove", handleUserScroll, { passive: true });
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("wheel", handleUserScroll);
      document.removeEventListener("touchmove", handleUserScroll);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuIsOpen]);

  // Close menu when route changes
  useEffect(() => {

    //eslint-disable-next-line
    setMenuIsOpen(false);
  }, [pathname]);

  // Handle link click - close menu
  const handleLinkClick = () => {
    setMenuIsOpen(false);
  };

  // Toggle menu
  const toggleMenu = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Menu Button */}
      <span
        ref={buttonRef}
        onClick={toggleMenu}
        className="flex flex-col items-center text-xs cursor-pointer hover:text-green-200 transition-colors duration-200"
        aria-label="Toggle menu"
        aria-expanded={menuIsOpen}
      >
        <FaBarsProgress className="text-2xl" />
        <label className="cursor-pointer">Menu</label>
      </span>

      {/* Dropdown Menu - Redesigned */}
      {menuIsOpen && (
        <div
          ref={menuRef}
          className="absolute bottom-full right-0 mb-3 min-w-[180px] bg-white rounded-xl shadow-2xl overflow-hidden animate-slide-up z-50 border border-gray-100"
          role="menu"
        >
          {/* Menu Header */}
          <div className="bg-gradient-to-r from-[#458328] to-[#539b32] px-4 py-3">
            <p className="text-white text-sm font-semibold">Quick Menu</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/contact"
              onClick={handleLinkClick}
              className="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-green-50 hover:text-[#458328] transition-colors duration-150 border-b border-gray-50"
              role="menuitem"
            >
              <span className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full text-green-600">
                📞
              </span>
              <span className="font-medium">Contact Us</span>
            </Link>

            <Link
              href="/categories"
              onClick={handleLinkClick}
              className="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-green-50 hover:text-[#458328] transition-colors duration-150 border-b border-gray-50"
              role="menuitem"
            >
              <span className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
                📂
              </span>
              <span className="font-medium">Categories</span>
            </Link>

            <Link
              href="/track-order"
              onClick={handleLinkClick}
              className="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-green-50 hover:text-[#458328] transition-colors duration-150 border-b border-gray-50"
              role="menuitem"
            >
              <span className="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-full text-purple-600">
                ℹ️
              </span>
              <span className="font-medium">Track Order</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuButton;