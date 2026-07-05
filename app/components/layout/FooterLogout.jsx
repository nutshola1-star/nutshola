// app/components/layout/FooterLogout.jsx
"use client";

import React from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";

const FooterLogout = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      if (logout) await logout();
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  return (
    user && (
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 text-white/60 hover:text-red-400 transition-colors"
      >
        <FaSignOutAlt size={14} />
        <span className="hidden md:flex">Logout</span>
      </button>
    )
  );
};

export default FooterLogout;
