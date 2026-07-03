import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-[#f9fff7]">
      {/* 404 Number */}
      <h1 className="text-8xl font-extrabold text-green-600 mb-4 drop-shadow-sm">
        404
      </h1>
      
      {/* Bilingual Headings */}
      <h2 className="text-3xl font-semibold text-gray-800 mb-3">
        Page Not Found | পেজটি পাওয়া যায়নি
      </h2>
      
      {/* Friendly Explanations */}
      <p className="text-gray-600 mb-8 max-w-md text-lg">
        Oops! It looks like we spilled the nuts. The page you are looking for has been moved or {"doesn't"} exist.
        <br /><br />
        দুঃখিত! আপনি যে পেজটি খুঁজছেন তা সম্ভবত সরানো হয়েছে অথবা লিংকটি সঠিক নয়।
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/" 
          className="px-8 py-3 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition-colors duration-300 font-medium"
        >
          হোম পেজে ফিরে যান (Home)
        </Link>
        <Link 
          href="/all-products" 
          className="px-8 py-3 bg-white text-green-700 border border-green-600 rounded-md shadow-sm hover:bg-green-50 transition-colors duration-300 font-medium"
        >
          Shop Now (কেনাকাটা করুন)
        </Link>
      </div>
    </div>
  );
}