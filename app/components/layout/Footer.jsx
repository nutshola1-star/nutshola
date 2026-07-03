import Link from 'next/link'
import React from 'react'
import FooterLogout from './FooterLogout'

const Footer = () => {
  return (
    <div className="w-full bg-[#267700] text-white py-8">
      <div className="container mx-auto px-4">
        <p>&copy; 2023 Nutshola. All rights reserved.</p>
        <Link href="/admin/dashboard" className="text-sm hover:underline">
          Admin Dashboard
        </Link>
        <FooterLogout />
      </div>
    </div>
  )
}

export default Footer