// app/admin/services/ServicesClient.jsx

"use client";

import React, { useState } from "react";
import AdminMenu from "../../components/menu/AdminMenu";
import {
  FaBars,
  FaTimes
} from "react-icons/fa";
import HomeSlides from "./HomeSlides";
import Coupons from "./Coupons";
import CourierCharges from "./CourierCharges";

const ServicesClient = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [activeService, setActiveService] = useState("home-slide");

  const services = [
    {
      id: "home-slide",
      name: "Home Slide",
    },
    {
      id: "coupons",
      name: "Coupons",
    },
    {
      id: "courier-charges",
      name: "Courier Charges",
    },
  ];

  const renderService = () => {
    switch (activeService) {
      case "home-slide":
        return <HomeSlides />;
      case "coupons":
        return <Coupons />;
      case "courier-charges":
        return <CourierCharges />;
      default:
        return <HomeSlides />;
    }
  };
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
              Services Management
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Manage your other services.
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
        <main className="px-2 md:px-4 pb-8 flex-1">
          {/* Services Menu */}
          <div className="border-b pb-1 border-gray-200 px-2 flex-shrink-0 overflow-x-auto">
            <div className="flex gap-1">
              {services.map((service) => (
                <button
                  key={service?.id}
                  onClick={() => setActiveService(service.id)}
                  className={`px-1.5 py-0.5 rounded text-xs md:text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap border ${
                    activeService === service.id
                      ? "text-white bg-[#559F34] border-[#559F34]"
                      : "text-[#559F34] border-[#559F34] bg-transparent hover:bg-[#559F34]/10"
                  }`}
                >
                  {service?.name}
                </button>
              ))}
            </div>
          </div>

          {/* Service Content */}
          <div>{renderService()}</div>
        </main>
      </div>
    </div>
  );
};

export default ServicesClient;
