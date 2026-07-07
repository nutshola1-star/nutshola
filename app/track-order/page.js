// app/track-order/page.jsx
import React from "react";
import TrackOrderClient from "./TrackOrderClient";

export const metadata = {
  title: "Track Order - Nutshola",
  description: "Track your Nutshola order status. Enter your order number or phone number to get real-time updates on your premium nuts and spices delivery.",
  keywords: [
    "Nutshola",
    "track order",
    "order status",
    "premium nuts",
    "spices online BD",
    "order tracking Bangladesh",
    "কাজুবাদাম",
    "কাঠবাদাম",
    "organic spices",
    "dry fruits Bangladesh"
  ],
  authors: [{ name: "Nutshola" }],
  creator: "Nutshola",
  publisher: "Nutshola",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.nutshola.com/track-order",
    siteName: "Nutshola",
    title: "Track Your Order - Nutshola",
    description: "Track your Nutshola order status. Get real-time updates on your premium nuts and spices delivery.",
    images: [
      {
        url: "https://res.cloudinary.com/i8ldorjv/image/upload/v1782984009/NutsholaBanner_iimeqh.jpg",
        alt: "Nutshola - Track Your Order",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const TrackOrder = () => {
  return <TrackOrderClient />;
};

export default TrackOrder;