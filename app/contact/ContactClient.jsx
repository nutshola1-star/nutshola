// app/contact/ContactClient.jsx
"use client";

import React, { useState } from "react";
import {
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { BsFillTelephoneFill } from "react-icons/bs";
import toast from "react-hot-toast";
import Image from "next/image";

const ContactClient = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          "Message sent successfully! We'll get back to you soon.",
          {
            duration: 4000,
            style: {
              background: "#559F34",
              color: "#fff",
            },
            icon: "✅",
          },
        );

        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error("Failed to send");
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.", {
        duration: 4000,
        style: {
          background: "#3A393D",
          color: "#fff",
        },
        icon: "❌",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contact information
  const contactInfo = [
    {
      icon: <FaPhone className="text-2xl" />,
      title: "Call Us",
      details: "+880 1903 500 222",
      link: "tel:+8801903500222",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FaWhatsapp className="text-2xl" />,
      title: "WhatsApp",
      details: "+880 1903 500 222",
      link: "https://wa.me/8801903500222",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <FaEnvelope className="text-2xl" />,
      title: "Email Us",
      details: "nutshola.bd@gmail.com",
      link: "mailto:nutshola.bd@gmail.com",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: <FaMapMarkerAlt className="text-2xl" />,
      title: "Visit Us",
      details: "West Matikata, Dhaka Cantonment, Dhaka 1206",
      link: "https://www.google.com/maps/place/Matikata+Bazar/@23.8185195,90.3925431,17.68z/data=!4m14!1m7!3m6!1s0x3755c7005f48b405:0x7572fb7bbc465773!2sWest+matikata!8m2!3d23.8371582!4d90.3913172!16s%2Fg%2F11z588ynnz!3m5!1s0x3755c6e70bdbb3e5:0x8332496368333f5c!8m2!3d23.8190178!4d90.3950686!16s%2Fg%2F11f3xx9b8h?entry=ttu&g_ep=EgoyMDI2MDcxMi4wIKXMDSoASAFQAw%3D%3D",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4 md:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-[#3A393D] mb-4">
            Get In Touch
            <span className="block text-[#559F34] text-lg md:text-2xl mt-2">
              {"We'd"} Love to Hear From You!
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Have questions about our premium nuts and spices? Need help with
            your order? Reach out to us through any of the channels below.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {contactInfo.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target={item.link.startsWith("http") ? "_blank" : undefined}
              rel={
                item.link.startsWith("http") ? "noopener noreferrer" : undefined
              }
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center group hover:-translate-y-1 border border-gray-100"
            >
              <div
                className={`w-14 h-14 rounded-full ${item.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                {item.icon}
              </div>
              <h3 className="font-semibold text-[#3A393D] text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm">{item.details}</p>
              <span className="inline-block mt-3 text-[#559F34] text-sm font-medium group-hover:underline">
                Contact Now →
              </span>
            </a>
          ))}
        </div>

        {/* Two Column Layout: Form + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#7ECB2A] rounded-full flex items-center justify-center">
                <FaPaperPlane className="text-white text-lg" />
              </div>
              <h2 className="text-2xl font-bold text-[#3A393D]">
                Send Us a Message
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A393D] mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#559F34] focus:border-transparent outline-none transition-all"
                    placeholder="Sabbir Hossen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A393D] mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#559F34] focus:border-transparent outline-none transition-all"
                    placeholder="sabbir@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A393D] mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#559F34] focus:border-transparent outline-none transition-all"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A393D] mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full text-gray-600 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#559F34] focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#559F34] to-[#7ECB2A] text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </button>
            </form>

            {/* Alternative Contact */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Prefer direct email?{" "}
                <a
                  href="mailto:nutshola.bd@gmail.com"
                  className="text-[#559F34] font-semibold hover:underline"
                >
                  nutshola.bd@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Map & Hours Section */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6 bg-gradient-to-r from-[#559F34] to-[#7ECB2A]">
                <h3 className="text-white font-bold text-xl flex items-center gap-2">
                  <MdLocationOn className="text-2xl" />
                  Find Us Here
                </h3>
              </div>
              <div className="p-2">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2270.8352709573337!2d90.39254311205194!3d23.818519522473537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c6e70bdbb3e5%3A0x8332496368333f5c!2sMatikata%20Bazar!5e0!3m2!1sen!2sbd!4v1784046630123!5m2!1sen!2sbd"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                  title="Nutshola Location"
                ></iframe>
                <div className="p-4 bg-gray-50 rounded-b-lg">
                  <p className="text-[#3A393D] font-medium flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[#559F34]" />
                    West Matikata, Dhaka Cantonment, Dhaka 1206
                  </p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#3A393D] rounded-full flex items-center justify-center">
                  <FaClock className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold text-[#3A393D]">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Everyday</span>
                  <span className="font-semibold text-[#3A393D]">
                    9:00 AM - 11:59 PM
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-[#3A393D] text-center">
                  🚚 <span className="font-semibold">Second-day delivery (Inside Dhaka) </span>{" "}
                  available for orders before 2:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#3A393D] to-[#559F34] rounded-2xl p-8 text-center shadow-xl">
          <h3 className="text-white text-2xl font-bold mb-2">
            Need Immediate Assistance?
          </h3>
          <p className="text-white/90 mb-4">
            Call us directly or send us a WhatsApp message for quick support
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+8801903500222"
              className="inline-flex items-center gap-2 bg-white text-[#559F34] px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <BsFillTelephoneFill />
              Call Now
            </a>
            <a
              href="https://wa.me/8801903500222"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <FaWhatsapp className="text-xl" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactClient;
