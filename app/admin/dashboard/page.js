// app/admin/dashboard/page.js
"use client"; // Required for state and click handlers

import React, { useState } from 'react';
import AdminMenu from '../../components/menu/AdminMenu';
import { FaBars, FaTimes } from 'react-icons/fa'; // Added icons for the toggle button

const AdminDashboard = () => {
  // State to manage mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State to manage active tab (passed down to AdminMenu)
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans relative md:px-10">
      
      {/* Mobile Menu Overlay - Closes menu when clicking outside of it */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Left side: Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:flex-shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Pass state handlers to the menu so it can close itself on mobile when a link is clicked */}
        <AdminMenu 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          setMobileMenuOpen={setIsMobileMenuOpen} 
        />
      </div>
      
      {/* Right side: Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        
        {/* Top Header */}
        <header className="bg-white shadow-sm px-4 md:px-8 py-4 md:py-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#3A393D]">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Welcome back, Admin! Here is what is happening today.</p>
          </div>
          
          {/* Hamburger Menu Button - Visible only on md/sm screens (hidden on lg) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-[#3A393D] hover:text-[#559F34] focus:outline-none p-2 rounded-md transition-colors"
          >
            {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </header>

        {/* Dashboard Content Container */}
        <main className="px-4 md:px-8 pb-8 flex-1">
          
          {/* Example Analytics Cards Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            
            {/* Card 1: Total Orders */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-[#559F34]">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Orders</h3>
              <p className="text-3xl font-bold text-[#3A393D] mt-2">124</p>
            </div>
            
            {/* Card 2: Revenue */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-[#7ECB2A]">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Revenue</h3>
              <p className="text-3xl font-bold text-[#3A393D] mt-2">৳ 45,200</p>
            </div>
            
            {/* Card 3: Active Users */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-[#559F34]">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Active Customers</h3>
              <p className="text-3xl font-bold text-[#3A393D] mt-2">89</p>
            </div>
            
          </div>

        </main>
      </div>
    </div>
  )
}

export default AdminDashboard;