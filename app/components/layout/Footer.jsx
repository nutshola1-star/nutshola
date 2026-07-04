// app/components/layout/Footer.jsx
import Link from "next/link";
import React from "react";
import FooterLogout from "./FooterLogout";
import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaArrowUp,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-[#267700] text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                <img
                  src="/logo/WhiteBgLogo.png"
                  alt="Nutshola"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">Nutshola</h3>
                <p className="text-sm text-[#7ECB2A]">
                  Premium Nuts & Dry Fruits
                </p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Your trusted source for premium quality nuts, dry fruits, and
              organic snacks. Delivering freshness and taste since 2023.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#7ECB2A] transition-colors"
              >
                <FaFacebook size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#7ECB2A] transition-colors"
              >
                <FaInstagram size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#7ECB2A] transition-colors"
              >
                <FaYoutube size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#7ECB2A] transition-colors"
              >
                <FaTwitter size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#7ECB2A] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="hover:text-[#7ECB2A] transition-colors"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="hover:text-[#7ECB2A] transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#7ECB2A] transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-[#7ECB2A] mt-0.5 flex-shrink-0" />
                <span>123, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-[#7ECB2A] flex-shrink-0" />
                <a
                  href="tel:+8801234567890"
                  className="hover:text-white transition-colors"
                >
                  +880 1234-567890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-[#7ECB2A] flex-shrink-0" />
                <a
                  href="mailto:info@nutshola.com"
                  className="hover:text-white transition-colors"
                >
                  info@nutshola.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-white/70 mb-3">
              Subscribe to get special offers, free giveaways, and exclusive
              deals.
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#7ECB2A] transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#7ECB2A] text-white rounded-lg hover:bg-[#6ab824] transition-colors font-semibold"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-white/60">
              &copy; {new Date().getFullYear()} Nutshola. All rights reserved.
            </p>
            <div className="flex items-center text-xs md:text-sm gap-2 md:gap-6 text-white/60">
              <Link
                href="/privacy-policy"
                className="hover:text-[#7ECB2A] text-center transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-[#7ECB2A] text-center transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/shipping"
                className="hover:text-[#7ECB2A] text-center transition-colors"
              >
                Shipping Info
              </Link>

              <>
                <Link
                  href="/admin/dashboard"
                  className="hover:text-[#7ECB2A] transition-colors"
                >
                  Dashboard
                </Link>
                <FooterLogout />
              </>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
