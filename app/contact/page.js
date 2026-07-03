import React from 'react'

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
    url: 'https://www.nutshola.com', // Replace with your actual domain
    siteName: 'Nutshola',
    title: 'Nutshola | সেরা মানের বাদাম ও মসলা অনলাইনে',
    description: 'Nutshola থেকে কিনুন ১০০% ফ্রেশ, খাঁটি বাদাম এবং রান্নার মসলা। Order your premium nuts and spices today!',
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
  return (
    <div>Contact</div>
  )
}

export default Contact