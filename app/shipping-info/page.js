// app/contact/page.jsx
import React from 'react';
import ShippingInfoClient from './ShippingInfoClient';

export const metadata = {
  title: 'Shipping Info - Nutshola',
  description: 'Check the delivery chargers of Nutshola!',
  keywords: [
    'Nutshola',
    'contact us',
    'premium nuts',
    'spices online BD',
    'সেরা মানের বাদাম',
    'খাঁটি মসলা',
    'buy dry fruits Bangladesh',
    'কাজুবাদাম',
    'কাঠবাদাম',
    'organic spices',
    'fresh nuts and seeds',
    'Shipping Info'
  ],
  authors: [{ name: 'Nutshola' }],
  creator: 'Nutshola',
  publisher: 'Nutshola',
  openGraph: {
    type: 'website',
    locale: 'en_US', 
    url: 'https://www.nutshola.com',
    siteName: 'Nutshola',
    title: 'Shipping Info - Nutshola | Premium Nuts & Spices',
    description: 'Get in touch with Nutshola for premium quality nuts, spices, and exceptional customer service.',
    images: [
      {
        url: 'https://res.cloudinary.com/i8ldorjv/image/upload/v1782984009/NutsholaBanner_iimeqh.jpg', 
        alt: 'Nutshola - Premium Nuts and Spices',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const ShippingInfo = () => {
  return <ShippingInfoClient />;
};

export default ShippingInfo;