// app/admin/profile/ProfileClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/menu/AdminMenu";
import {
  FaBars,
  FaTimes,
  FaEdit,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCity,
  FaGlobe,
  FaSave,
  FaTimesCircle,
  FaUserCog,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProfileClient = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateProfile, changePassword } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    district: "",
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      //eslint-disable-next-line
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        district: user.district || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send ONLY profile data (no password)
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        district: formData.district,
      });

      if (result.success) {
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      if (result.success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        toast.success("Password changed successfully!");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        district: user.district || "",
      });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#559F34]"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans relative md:px-10">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden transition-opacity z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left side: Sidebar */}
      <div
        className={`
        fixed top-20 bottom-0 left-0 transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:flex-shrink-0 z-50
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <AdminMenu
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileMenuOpen={setIsMobileMenuOpen}
        />
      </div>

      {/* Right side: Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="bg-white shadow-sm px-4 md:px-8 py-4 md:py-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#3A393D]">
              Profile
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Manage your profile and settings.
            </p>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-[#3A393D] hover:text-[#559F34] focus:outline-none p-2 rounded-md transition-colors"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </header>

        {/* Main Content Area */}
        <main className="px-2 md:px-8 pb-8 flex-1">
          {/* Profile Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info Card - Takes 2/3 on large screens */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-[#7ECB2A] flex items-center justify-center">
                      <FaUser className="text-white text-sm md:text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-sm md:text-xl font-bold text-[#3A393D]">
                        {user.name}
                      </h2>
                      <p className="text-gray-500 text-xs md:text-sm">
                        {user.role === 1
                          ? "Administrator"
                          : user.role === 2
                            ? "Moderator"
                            : "User"}
                      </p>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#7ECB2A] text-white rounded-lg hover:bg-[#559F34] transition-colors"
                    >
                      <FaEdit className="text-xs md:text-sm" />
                      {isMobileMenuOpen && "Edit Profile"}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  // Edit Form
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#3A393D] mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#3A393D] mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#3A393D] mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#3A393D] mb-1">
                          District
                        </label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#3A393D] mb-1">
                          Email (Read-only)
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 bg-[#7ECB2A] text-white rounded-lg hover:bg-[#559F34] transition-colors disabled:opacity-50"
                      >
                        <FaSave className="text-sm" />
                        {isLoading ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-[#9b2222] rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <FaTimesCircle className="text-sm" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <FaEnvelope className="text-[#559F34] mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-[#3A393D] font-medium">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaPhone className="text-[#559F34] mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-[#3A393D] font-medium">
                            {user.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className="text-[#559F34] mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="text-[#3A393D] font-medium">
                            {user.address || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaCity className="text-[#559F34] mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">District</p>
                          <p className="text-[#3A393D] font-medium">
                            {user.district || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaUserCog className="text-[#559F34] mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Role</p>
                          <p className="text-[#3A393D] font-medium">
                            {user.role === 1
                              ? "Administrator"
                              : user.role === 2
                                ? "Moderator"
                                : "User"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Cards - Takes 1/3 */}
            <div className="space-y-6">
              {/* Account Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-[#3A393D] mb-4">
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-[#3A393D] font-medium">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-[#3A393D] font-medium">
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="text-[#3A393D] font-mono text-sm truncate">
                      {user.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Password Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full flex items-center justify-between text-[#3A393D] font-semibold"
                >
                  <span>Change Password</span>
                  <span className="text-[#559F34]">
                    {showPasswordForm ? "−" : "+"}
                  </span>
                </button>

                {showPasswordForm && (
                  <form
                    onSubmit={handleChangePassword}
                    className="mt-4 space-y-3"
                  >
                    <div>
                      <label className="block text-sm text-[#3A393D] mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#3A393D] mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#3A393D] mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ECB2A] text-[#3A393D]"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2 bg-[#7ECB2A] text-white rounded-lg hover:bg-[#559F34] transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileClient;
