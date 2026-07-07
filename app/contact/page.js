// app/contact/page.jsx
import React from 'react';
import ContactClient from './ContactClient';

export const metadata = {
  title: 'Contact Us - Nutshola',
  description: 'Get in touch with Nutshola for any inquiries or support. We are here to help you with all your premium nut and spice needs!',
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
    'fresh nuts and seeds'
  ],
  authors: [{ name: 'Nutshola' }],
  creator: 'Nutshola',
  publisher: 'Nutshola',
  openGraph: {
    type: 'website',
    locale: 'en_US', 
    url: 'https://www.nutshola.com',
    siteName: 'Nutshola',
    title: 'Contact Us - Nutshola | Premium Nuts & Spices',
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

const Contact = () => {
  return <ContactClient />;
};

export default Contact;