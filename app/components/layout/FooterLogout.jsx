"use client";

import React from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

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
      <div>
        <button
          className="text-sm text-red-300 hover:underline"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    )
  );
};

export default FooterLogout;
