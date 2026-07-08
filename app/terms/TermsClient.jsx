// app/terms/TermsClient.jsx
'use client'

import React from 'react';
import { 
  FaShieldAlt, 
  FaShoppingCart, 
  FaTruck, 
  FaUndo, 
  FaLock, 
  FaEnvelope,
  FaPhone,
  FaLeaf,
  FaSeedling,
  FaSpice,
  FaCheckCircle,
  FaExclamationTriangle,
  FaStore,
  FaUserShield,
  FaCreditCard,
  FaClipboardList,
  FaGavel,
  FaGlobe,
  FaClock,
  FaBoxOpen,
  FaHandshake,
  FaApple,
  FaPepperHot,
  FaCircle
} from 'react-icons/fa';
import { GiPeanut } from "react-icons/gi";

const TermsClient = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center bg-[#559F34]/10 rounded-full px-6 py-2 mb-4">
          <FaGavel className="text-[#559F34] mr-2" />
          <span className="text-[#559F34] font-semibold text-sm">Legal Document</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#3A393D] mb-4">
          Terms of Service
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
          Welcome to Nutshola! Please read these terms carefully before using our services or purchasing our premium nuts, dryfood, mangoes, and spices.
        </p>
        <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
          <span>Last Updated: January 2026</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>Version 2.0</span>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <a href="#general" className="bg-white hover:bg-[#559F34]/5 p-3 rounded-lg shadow-sm text-center transition-all border border-gray-200 hover:border-[#559F34]">
          <FaShieldAlt className="text-[#559F34] mx-auto mb-1" />
          <span className="text-xs font-medium text-[#3A393D]">General</span>
        </a>
        <a href="#products" className="bg-white hover:bg-[#7ECB2A]/5 p-3 rounded-lg shadow-sm text-center transition-all border border-gray-200 hover:border-[#7ECB2A]">
          <FaLeaf className="text-[#7ECB2A] mx-auto mb-1" />
          <span className="text-xs font-medium text-[#3A393D]">Products</span>
        </a>
        <a href="#orders" className="bg-white hover:bg-[#559F34]/5 p-3 rounded-lg shadow-sm text-center transition-all border border-gray-200 hover:border-[#559F34]">
          <FaClipboardList className="text-[#559F34] mx-auto mb-1" />
          <span className="text-xs font-medium text-[#3A393D]">Orders</span>
        </a>
        <a href="#shipping" className="bg-white hover:bg-[#7ECB2A]/5 p-3 rounded-lg shadow-sm text-center transition-all border border-gray-200 hover:border-[#7ECB2A]">
          <FaTruck className="text-[#7ECB2A] mx-auto mb-1" />
          <span className="text-xs font-medium text-[#3A393D]">Shipping</span>
        </a>
        <a href="#returns" className="bg-white hover:bg-[#559F34]/5 p-3 rounded-lg shadow-sm text-center transition-all border border-gray-200 hover:border-[#559F34]">
          <FaUndo className="text-[#559F34] mx-auto mb-1" />
          <span className="text-xs font-medium text-[#3A393D]">Returns</span>
        </a>
        <a href="#payment" className="bg-white hover:bg-[#7ECB2A]/5 p-3 rounded-lg shadow-sm text-center transition-all border border-gray-200 hover:border-[#7ECB2A]">
          <FaCreditCard className="text-[#7ECB2A] mx-auto mb-1" />
          <span className="text-xs font-medium text-[#3A393D]">Payment</span>
        </a>
        <a href="#privacy" className="bg-white hover:bg-[#559F34]/5 p-3 rounded-lg shadow-sm text-center transition-all border border-gray-200 hover:border-[#559F34]">
          <FaLock className="text-[#559F34] mx-auto mb-1" />
          <span className="text-xs font-medium text-[#3A393D]">Privacy</span>
        </a>
        <a href="#responsibility" className="bg-white hover:bg-[#7ECB2A]/5 p-3 rounded-lg shadow-sm text-center transition-all border border-gray-200 hover:border-[#7ECB2A]">
          <FaUserShield className="text-[#7ECB2A] mx-auto mb-1" />
          <span className="text-xs font-medium text-[#3A393D]">Responsibility</span>
        </a>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* 1. General Terms */}
        <div id="general" className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-l-4 border-[#559F34] scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#559F34]/10 rounded-lg">
              <FaShieldAlt className="text-[#559F34] text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-[#3A393D]">1. General Terms</h2>
          </div>
          <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
            <p className="font-medium">By accessing and using {"Nutshola's"} website and services, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before placing any order.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>These terms apply to all users, customers, and visitors of our website and services.</li>
              <li>Nutshola reserves the right to update or modify these terms at any time without prior notice.</li>
              <li>Continued use of our services after changes constitutes acceptance of the new terms.</li>
              <li>If you do not agree with any part of these terms, please do not use our services.</li>
              <li>All products are subject to availability and we reserve the right to discontinue any product at any time.</li>
              <li>We reserve the right to refuse service to anyone for any reason at any time.</li>
              <li>These terms constitute the entire agreement between you and Nutshola.</li>
              <li>Any disputes arising from these terms shall be governed by the laws of Bangladesh.</li>
            </ul>
          </div>
        </div>

        {/* 2. Products & Quality */}
        <div id="products" className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-l-4 border-[#7ECB2A] scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#7ECB2A]/10 rounded-lg">
              <FaLeaf className="text-[#7ECB2A] text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-[#3A393D]">2. Products & Quality</h2>
          </div>
          <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
            <p className="font-medium">Nutshola takes pride in offering premium quality nuts, dryfood, mango products, and spices. Our commitment to quality is reflected in every product we sell.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <GiPeanut className="text-[#559F34]" />
                  <h4 className="font-semibold text-[#3A393D]">Premium Nuts</h4>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
                  <li>Freshly sourced from trusted suppliers</li>
                  <li>Properly processed and packaged</li>
                  <li>Available in various sizes</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaApple className="text-[#559F34]" />
                  <h4 className="font-semibold text-[#3A393D]">Premium Mangoes</h4>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
                  <li>Seasonal availability</li>
                  <li>Fresh and naturally ripened</li>
                  <li>Direct from farms</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaPepperHot className="text-[#559F34]" />
                  <h4 className="font-semibold text-[#3A393D]">Premium Spices</h4>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
                  <li>Authentic and pure spices</li>
                  <li>Properly dried and stored</li>
                  <li>Rich aroma and flavor</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaSeedling className="text-[#559F34]" />
                  <h4 className="font-semibold text-[#3A393D]">Dryfood</h4>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
                  <li>High-quality dried products</li>
                  <li>Properly preserved</li>
                  <li>Long shelf life</li>
                </ul>
              </div>
            </div>

            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><span className="font-semibold">Freshness Guarantee:</span> All products are fresh and properly packaged to maintain quality.</li>
              <li><span className="font-semibold">Product Descriptions:</span> We provide accurate descriptions and images. Minor variations may occur.</li>
              <li><span className="font-semibold">Hygiene Standards:</span> Products are processed and packaged following strict hygiene standards.</li>
              <li><span className="font-semibold">Natural Products:</span> Our products are natural and may have variations in color, size, and shape.</li>
              <li><span className="font-semibold">Storage Recommendations:</span> Follow storage instructions on packaging for best quality.</li>
              <li><span className="font-semibold">Allergen Information:</span> Product descriptions include allergen information. Please check carefully.</li>
              <li><span className="font-semibold">Shelf Life:</span> Expiry dates are clearly mentioned on all packaging.</li>
              <li><span className="font-semibold">Quality Control:</span> Each product batch undergoes quality testing before dispatch.</li>
            </ul>
          </div>
        </div>

        {/* 3. Orders & Pricing */}
        <div id="orders" className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-l-4 border-[#559F34] scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#559F34]/10 rounded-lg">
              <FaClipboardList className="text-[#559F34] text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-[#3A393D]">3. Orders & Pricing</h2>
          </div>
          <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
            <p className="font-medium">All orders placed through our website are subject to acceptance and availability. We reserve the right to cancel or refuse any order.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">Order Placement:</span> Orders can be placed through our website, phone, or in-person.</li>
              <li><span className="font-semibold">Order Confirmation:</span> You will receive confirmation via email or SMS after placing an order.</li>
              <li><span className="font-semibold">Price Changes:</span> Prices are subject to change without notice. The price at the time of order applies.</li>
              <li><span className="font-semibold">Bulk Orders:</span> For bulk orders, please contact us directly for special pricing and terms.</li>
              <li><span className="font-semibold">Minimum Order:</span> No minimum order requirement for most products, except certain promotional items.</li>
              <li><span className="font-semibold">Order Modifications:</span> Changes can be made within 24 hours of placing the order.</li>
              <li><span className="font-semibold">Order Cancellation:</span> Orders can be cancelled before dispatch. Cancellation fees may apply.</li>
              <li><span className="font-semibold">Seasonal Availability:</span> Mangoes and some products are seasonal and subject to availability.</li>
              <li><span className="font-semibold">Promotional Offers:</span> All promotions are subject to terms and conditions mentioned with the offer.</li>
              <li><span className="font-semibold">Order Tracking:</span> Track your order status through our website or customer service.</li>
            </ul>
          </div>
        </div>

        {/* 4. Shipping & Delivery */}
        <div id="shipping" className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-l-4 border-[#7ECB2A] scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#7ECB2A]/10 rounded-lg">
              <FaTruck className="text-[#7ECB2A] text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-[#3A393D]">4. Shipping & Delivery</h2>
          </div>
          <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
            <p className="font-medium">We aim to deliver your orders promptly and safely. Our delivery charges are calculated based on weight and location.</p>
            
            <div className="bg-[#559F34]/5 p-4 rounded-lg border border-[#559F34]/20">
              <h4 className="font-semibold text-[#3A393D] mb-2">Delivery Charges</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Charges are based on weight and location</li>
                <li>Inside Dhaka: As per our delivery charge chart</li>
                <li>Outside Dhaka: As per our delivery charge chart</li>
                <li>Extra weight charge: ৳20 per KG for orders exceeding maximum range</li>
                <li>Delivery charges are non-refundable</li>
              </ul>
            </div>

            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">Delivery Areas:</span> We deliver throughout Bangladesh. Remote areas may have extended delivery times.</li>
              <li><span className="font-semibold">Delivery Time:</span> 1-3 business days for Dhaka, 2-5 business days for outside Dhaka.</li>
              <li><span className="font-semibold">Delivery Attempts:</span> Two delivery attempts will be made. After failure, order may be cancelled.</li>
              <li><span className="font-semibold">Product Inspection:</span> Always check the product upon delivery before accepting.</li>
              <li><span className="font-semibold">Delivery Confirmation:</span> A confirmation message will be sent after successful delivery.</li>
              <li><span className="font-semibold">Force Majeure:</span> Delivery may be delayed due to natural disasters, political unrest, or unforeseen circumstances.</li>
              <li><span className="font-semibold">Contact for Delivery:</span> Keep your phone active for delivery coordination.</li>
            </ul>
          </div>
        </div>

        {/* 5. Returns & Refunds */}
        <div id="returns" className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-l-4 border-[#559F34] scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#559F34]/10 rounded-lg">
              <FaUndo className="text-[#559F34] text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-[#3A393D]">5. Returns & Refunds</h2>
          </div>
          <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
            <p className="font-medium">Our return and refund policy is designed to ensure customer satisfaction while maintaining product quality standards.</p>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-700">Important: No Return Policy</h4>
                  <p className="text-sm text-red-600">Once the delivery man leaves, no returns or exchanges are accepted. Please verify everything before accepting.</p>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">Product Inspection:</span> Inspect the product when the delivery man arrives. If not satisfied, you may refuse.</li>
              <li><span className="font-semibold">Refusal Charges:</span> If you refuse delivery, you must pay the delivery charge to the delivery man.</li>
              <li><span className="font-semibold">Damaged Products:</span> If a product is damaged during delivery, you may refuse delivery or contact us immediately.</li>
              <li><span className="font-semibold">Wrong Product:</span> If you receive the wrong product, please contact us within 24 hours for resolution.</li>
              <li><span className="font-semibold">Quality Issues:</span> If unsatisfied with product quality, contact us immediately with photos and details.</li>
              <li><span className="font-semibold">Refund Process:</span> Refunds, if approved, will be processed within 5-7 business days.</li>
              <li><span className="font-semibold">Refund Method:</span> Refunds will be credited to your original payment method or via bank transfer.</li>
              <li><span className="font-semibold">Non-Refundable Items:</span> Sale items, clearance items, and perishable goods are non-refundable.</li>
            </ul>
          </div>
        </div>

        {/* 6. Payment Terms */}
        <div id="payment" className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-l-4 border-[#7ECB2A] scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#7ECB2A]/10 rounded-lg">
              <FaCreditCard className="text-[#7ECB2A] text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-[#3A393D]">6. Payment Terms</h2>
          </div>
          <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
            <p className="font-medium">We offer multiple secure payment options for your convenience. All transactions are processed securely.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-[#559F34] text-xl mb-1">💵</div>
                <div className="text-xs font-semibold text-[#3A393D]">Cash on Delivery</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-[#559F34] text-xl mb-1">📱</div>
                <div className="text-xs font-semibold text-[#3A393D]">bKash</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-[#559F34] text-xl mb-1">📱</div>
                <div className="text-xs font-semibold text-[#3A393D]">Nagad</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-[#559F34] text-xl mb-1">🏦</div>
                <div className="text-xs font-semibold text-[#3A393D]">Bank Transfer</div>
              </div>
            </div>

            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">Cash on Delivery:</span> Pay in cash when the delivery man arrives. Exact change is appreciated.</li>
              <li><span className="font-semibold">Online Payment:</span> Secure online payments through mobile banking are available.</li>
              <li><span className="font-semibold">Prepaid Orders:</span> Orders paid in advance receive priority processing.</li>
              <li><span className="font-semibold">Payment Security:</span> All payment transactions are encrypted and secured.</li>
              <li><span className="font-semibold">Payment Confirmation:</span> You will receive a payment confirmation via email or SMS.</li>
              <li><span className="font-semibold">Failed Payments:</span> If a payment fails, you will be notified and can try again.</li>
              <li><span className="font-semibold">Currency:</span> All prices are in Bangladeshi Taka (BDT).</li>
              <li><span className="font-semibold">Taxes:</span> Applicable taxes are included in the product price.</li>
            </ul>
          </div>
        </div>

        {/* 7. Privacy Policy */}
        <div id="privacy" className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-l-4 border-[#559F34] scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#559F34]/10 rounded-lg">
              <FaLock className="text-[#559F34] text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-[#3A393D]">7. Privacy Policy</h2>
          </div>
          <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
            <p className="font-medium">Your privacy is important to us. We collect and use your information responsibly to provide better services.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">Information Collection:</span> We collect name, contact information, delivery address, and payment details.</li>
              <li><span className="font-semibold">Data Usage:</span> Your information is used for order processing, delivery, and improving our services.</li>
              <li><span className="font-semibold">Data Protection:</span> We implement security measures to protect your personal information.</li>
              <li><span className="font-semibold">Third-Party Sharing:</span> We do not sell or share your information with third parties except for delivery purposes.</li>
              <li><span className="font-semibold">Cookies:</span> Our website uses cookies to enhance your browsing experience.</li>
              <li><span className="font-semibold">Marketing Communications:</span> You may receive promotional emails. You can opt out at any time.</li>
              <li><span className="font-semibold">Data Retention:</span> We retain your information as long as necessary for business purposes.</li>
              <li><span className="font-semibold">Your Rights:</span> You have the right to access, modify, or delete your personal information.</li>
              <li><span className="font-semibold">Contact:</span> For privacy concerns, contact us at our official channels.</li>
            </ul>
          </div>
        </div>

        {/* 8. User Responsibility */}
        <div id="responsibility" className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-l-4 border-[#7ECB2A] scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#7ECB2A]/10 rounded-lg">
              <FaUserShield className="text-[#7ECB2A] text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-[#3A393D]">8. User Responsibility</h2>
          </div>
          <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
            <p className="font-medium">By using our services, you agree to certain responsibilities and obligations. Please ensure you understand and comply with them.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">Accurate Information:</span> Provide accurate and complete information when placing orders.</li>
              <li><span className="font-semibold">Account Security:</span> Maintain the security of your account credentials.</li>
              <li><span className="font-semibold">Prohibited Activities:</span> Do not misuse the website, services, or products.</li>
              <li><span className="font-semibold">Intellectual Property:</span> Respect our intellectual property rights and do not reproduce content without permission.</li>
              <li><span className="font-semibold">Compliance:</span> Comply with all applicable laws and regulations.</li>
              <li><span className="font-semibold">Feedback:</span> Provide honest and constructive feedback to help us improve.</li>
              <li><span className="font-semibold">Prohibited Items:</span> Do not attempt to purchase prohibited items or engage in fraudulent activities.</li>
              <li><span className="font-semibold">Age Restriction:</span> You must be at least 18 years old to place orders on our website.</li>
              <li><span className="font-semibold">Communication:</span> Respond to delivery calls and messages promptly.</li>
              <li><span className="font-semibold">Payment Responsibility:</span> Ensure you have the correct payment amount ready for delivery.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-12 bg-gradient-to-r from-[#559F34]/5 to-[#7ECB2A]/5 rounded-2xl p-8 border border-[#559F34]/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#559F34]/10 rounded-full">
              <FaHandshake className="text-[#559F34] text-2xl" />
            </div>
            <div>
              <h3 className="font-bold text-[#3A393D]">Need Help?</h3>
              <p className="text-sm text-gray-600">Our support team is here to assist you</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
              <FaEnvelope className="text-[#559F34]" />
              <span className="text-sm text-gray-700">nutshola1@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
              <FaPhone className="text-[#559F34]" />
              <span className="text-sm text-gray-700">+880 1903 500 222</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 text-center md:text-left">
              By using our services, you agree to these Terms of Service.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>© {new Date().getFullYear()} Nutshola</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>All rights reserved</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>Version 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsClient;