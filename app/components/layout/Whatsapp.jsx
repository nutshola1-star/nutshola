// app/components/layout/Whatsapp.jsx
import { FaWhatsapp } from "react-icons/fa";

const Whatsapp = () => {
  const phoneNumber = "8801903500222";
  const whatsappLink = `https://wa.me/${phoneNumber}`;

  return (
    <div className="fixed right-5 bottom-[100px] z-50">
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-8 md:w-12 h-8 md:h-12 bg-green-500 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 group animate-float"
        aria-label="Chat on WhatsApp"
      >
        {/* Moving glowing ring 1 - expands outward */}
        <div className="absolute inset-0 rounded-full bg-green-500 opacity-70 animate-ping-slow"></div>
        
        {/* Moving glowing ring 2 - rotates and pulses */}
        <div className="absolute inset-[-6px] rounded-full border-4 border-green-400 opacity-60 animate-spin-slow"></div>
        
        {/* Moving glowing ring 3 - rotates opposite direction */}
        <div className="absolute inset-[-12px] rounded-full border-2 border-green-300 opacity-40 animate-spin-reverse"></div>
        
        {/* Moving glowing ring 4 - dotted rotating ring */}
        <div className="absolute inset-[-18px] rounded-full border-2 border-dashed border-green-200 opacity-30 animate-spin-slow"></div>
        
        {/* Pulsing glow background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-400 via-green-500 to-green-600 opacity-90 blur-md animate-pulse-glow"></div>
        
        {/* Rotating gradient ring */}
        <div className="absolute inset-[-3px] rounded-full bg-gradient-to-r from-green-300 via-green-500 to-green-300 opacity-70 animate-spin-slow" style={{ padding: '2px' }}>
          <div className="w-full h-full rounded-full bg-green-500"></div>
        </div>
        
        {/* WhatsApp Icon */}
        <FaWhatsapp className="text-white text-2xl md:text-4xl relative z-10 drop-shadow-lg" />
        
        {/* Tooltip on hover */}
        <span className="absolute right-full mr-3 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          Chat with us
        </span>
      </a>
    </div>
  );
};

export default Whatsapp;