import React from 'react'

export const metadata = {
  title: 'All Products - Nutshola',
  description: 'Buy premium quality nuts, seeds, and spices online. Nutshola থেকে সুলভ মূল্যে কিনুন ১০০% ফ্রেশ ও খাঁটি বাদাম এবং রান্নার মসলা। Fast delivery across Bangladesh!',
  keywords: [
    'Nutshola',
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
    title: 'All Products - Nutshola',
    description: 'Browse our wide selection of premium quality nuts, seeds, and spices online. Nutshola থেকে সুলভ মূল্যে কিনুন ১০০% ফ্রেশ ও খাঁটি বাদাম এবং রান্নার মসলা। Fast delivery across Bangladesh!',
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

const AllProducts = () => {
  return (
    <div>All Products</div>
  )
}

export default AllProducts