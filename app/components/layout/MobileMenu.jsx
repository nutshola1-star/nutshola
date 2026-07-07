// app/components/layout/MobileMenu.jsx
import Link from "next/link";
import { MdHome } from "react-icons/md";
import { AiFillProduct } from "react-icons/ai";
import CartIcon from "../home/CartIcon";
import MenuButton from "./MenuButton";

const MobileMenu = () => {
  return (
    // Fixed bottom navigation - only visible on mobile
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-[#458328] border-t border-[#3A393D] shadow-lg z-40">
      <div className="flex justify-around items-center py-3 text-white">
        <Link
          href="/"
          className="flex flex-col items-center text-xs hover:text-green-200 transition-colors duration-200"
        >
          <MdHome className="text-2xl" />
          <span>Home</span>
        </Link>

        <Link
          href="/all-products"
          className="flex flex-col items-center text-xs hover:text-green-200 transition-colors duration-200"
        >
          <AiFillProduct className="text-2xl" />
          <span>Products</span>
        </Link>

        <div className="flex flex-col items-center text-xs">
          <CartIcon />
          <span>Cart</span>
        </div>

        <MenuButton />
      </div>
    </div>
  );
};

export default MobileMenu;
