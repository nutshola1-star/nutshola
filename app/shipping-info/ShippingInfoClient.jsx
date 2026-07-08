// app/components/ShippingInfoClient.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { FaSpinner, FaBox, FaTruck, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const ShippingInfoClient = () => {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharges = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courier-charges');
        const data = await response.json();
        
        if (data.success) {
          setCharges(data.charges);
        } else {
          setError(data.message || 'Failed to fetch charges');
        }
      } catch (error) {
        console.error('Fetch charges error:', error);
        setError('Failed to load courier charges');
      } finally {
        setLoading(false);
      }
    };

    fetchCharges();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-[#559F34] text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#3A393D] mb-3">
          Shipping & Delivery Information
        </h1>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          Please review our delivery charges and important shipping guidelines before placing your order.
        </p>
      </div>

      {/* Delivery Charges Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 border border-gray-200">
        <div className="bg-[#559F34] px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaTruck />
            Delivery Charges
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-[#3A393D] text-sm uppercase tracking-wider">
                  Weight Range (KG)
                </th>
                <th className="text-left py-4 px-6 font-semibold text-[#3A393D] text-sm uppercase tracking-wider">
                  Inside Dhaka
                </th>
                <th className="text-left py-4 px-6 font-semibold text-[#3A393D] text-sm uppercase tracking-wider">
                  Outside Dhaka
                </th>
              </tr>
            </thead>
            <tbody>
              {charges.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    No delivery charges configured yet
                  </td>
                </tr>
              ) : (
                charges.map((charge, index) => (
                  <tr 
                    key={charge._id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="py-4 px-6 text-sm font-medium text-[#3A393D]">
                      {charge.weightFrom} - {charge.weightTo}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-[#559F34]">
                      ৳{charge.insideDhaka}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-[#E67E22]">
                      ৳{charge.outsideDhaka}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Extra Weight Note */}
        {charges.length > 0 && (
          <div className="bg-[#7ECB2A]/10 border-t border-[#7ECB2A]/30 px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <FaExclamationTriangle className="text-[#7ECB2A] text-lg" />
              </div>
              <div>
                <p className="text-sm text-[#3A393D]">
                  <span className="font-semibold">Note:</span> For every 1 kg extra weight beyond the maximum range, 
                  <span className="font-semibold text-[#559F34]"> ৳20</span> will be added to the delivery charge.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Important Shipping Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#559F34]">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-[#559F34] text-xl flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#3A393D] mb-1">Check Your Product</h3>
              <p className="text-sm text-gray-600">
                Please carefully check your product when the delivery man arrives. 
                Ensure the product is in good condition and matches your order.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#E67E22]">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-[#E67E22] text-xl flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#3A393D] mb-1">No Return Policy</h3>
              <p className="text-sm text-gray-600">
                Once the delivery man leaves with the product, no returns or exchanges 
                will be accepted. Please verify everything before accepting.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#7ECB2A]">
          <div className="flex items-start gap-3">
            <FaBox className="text-[#7ECB2A] text-xl flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#3A393D] mb-1">Package Acceptance</h3>
              <p className="text-sm text-gray-600">
                If you choose not to accept the delivery, you are required to pay the 
                delivery charge to the delivery man for the transportation service.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#3A393D]">
          <div className="flex items-start gap-3">
            <FaTruck className="text-[#3A393D] text-xl flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#3A393D] mb-1">Delivery Time</h3>
              <p className="text-sm text-gray-600">
                Delivery typically takes 1-3 business days for Dhaka and 2-5 business 
                days for outside Dhaka, depending on your location.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gradient-to-r from-[#559F34]/5 to-[#7ECB2A]/5 rounded-lg p-6 border border-[#559F34]/20">
        <h3 className="font-semibold text-[#3A393D] mb-3 flex items-center gap-2">
          <FaTruck className="text-[#559F34]" />
          Important Delivery Information
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#559F34] font-bold">•</span>
            <span>Delivery charges are calculated based on the weight of your order and delivery location.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#559F34] font-bold">•</span>
            <span>For orders above {charges.length > 0 ? charges[charges.length - 1]?.weightTo || '4' : '4'} KG, an additional charge of ৳20 per KG applies.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#559F34] font-bold">•</span>
            <span>Please keep your phone number active for delivery coordination.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#559F34] font-bold">•</span>
            <span>Delivery may take longer during holidays or adverse weather conditions.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ShippingInfoClient;