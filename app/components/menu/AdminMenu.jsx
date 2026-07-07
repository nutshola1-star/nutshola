// app/admin/dashboard/components/AdminMenu.jsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Added to read the current URL
import { 
  FaUserCircle, 
  FaBoxes, 
  FaWarehouse, 
  FaChartLine, 
  FaSignOutAlt,
  FaTachometerAlt,
  FaShoppingCart,
  FaCog,
  FaUsers 
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const AdminMenu = ({ setMobileMenuOpen }) => {
  const { logout } = useAuth();
  const pathname = usePathname(); 

  // Added 'href' to every item to dictate where the link goes
  const menuItems = [
        {
      id: "profile",
      label: "Profile",
      href: "/admin/profile", // Route to Profile
      icon: <FaUserCircle className="w-5 h-5" />,
      description: "Manage your account"
    },
    {
      id: "products",
      label: "Products",
      href: "/admin/products", // Route to Products
      icon: <FaBoxes className="w-5 h-5" />,
      description: "Manage products"
    },
     {
      id: "orders",
      label: "Orders",
      href: "/admin/orders", // Route to Orders
      icon: <FaShoppingCart className="w-5 h-5" />,
      description: "Manage customer orders"
    },
    {
      id: "accounting",
      label: "Accounting",
      href: "/admin/accounting", // Route to Accounting
      icon: <FaChartLine className="w-5 h-5" />,
      description: "Financial reports"
    },
    {
      id: "users",
      label: "Users",
      href: "/admin/users", // Route to Users
      icon: <FaUsers className="w-5 h-5" />,
      description: "Manage user accounts"
    },
    {
      id: "services",
      label: "Services",
      href: "/admin/services", // Route to Services
      icon: <FaCog className="w-5 h-5" />,
      description: "Manage other services"
    },
  ];

  const handleLogout = async () => {
    if (logout) await logout();
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <div className="flex rounded-xl flex-col w-64 h-full bg-[#3A393D] text-white shadow-xl">
      
      {/* Logo/Brand - Fixed at top */}
      <div className="flex-shrink-0 p-6 border-b border-gray-600">
        <div className="flex items-center gap-3">
          <FaTachometerAlt className="text-[#7ECB2A] text-3xl" />
          <div>
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <p className="text-xs text-gray-400">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Scrollable */}
      <nav className="flex-1 overflow-y-auto min-h-0 p-4 custom-scrollbar">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            // Check if the current URL matches this link's destination
            const isActive = pathname === item.href;

            return (
              <li key={item.id}>
                {/* Changed from <button> to <Link> for real page routing */}
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? "bg-[#559F34] text-white shadow-md border-l-4 border-[#7ECB2A]" 
                      : "text-gray-300 hover:bg-[#559F34]/40 hover:text-white"
                    }
                  `}
                >
                  <div className={`${isActive ? "text-white" : "text-gray-400"}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium">{item.label}</span>
                    <p className="text-xs opacity-75">{item.description}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-600 space-y-2 bg-[#3A393D] rounded-b-xl">
        <Link href="/">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#559F34]/40 hover:text-white transition-colors">
            <FaShoppingCart className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <span className="font-medium">Store Front</span>
              <p className="text-xs opacity-75">View your store</p>
            </div>
          </button>
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
        >
          <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
          <div className="text-left">
            <span className="font-medium">Logout</span>
            <p className="text-xs opacity-75">Sign out of your account</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminMenu;