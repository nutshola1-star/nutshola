// app/layout.jsx
import "./globals.css";
import Header from "./components/layout/Header";
import { CartProvider } from "./context/CartContext";
import ToastProvider from "./components/ToastProvider";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AuthProvider>
          <CartProvider>
            {/* Header with deep navy background */}
            <div className="w-full bg-white fixed top-0 left-0 right-0 z-[60] shadow-md">
              <Header />
            </div>

            {/* Main content - add padding to account for fixed header */}
            <div className="w-full bg-[#f9fff7] pt-15 md:pt-28 pb-20 md:pb-8 min-h-screen">
              {children}
              <ToastProvider />
            </div>
            <div className="mb-10 md:mb-0">
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
