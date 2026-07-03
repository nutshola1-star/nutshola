"use client";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";

const CartIcon = () => {
  const { cartItems } = useCart();
  return (
    <Link href={"/cart"}>
      <>
        <FaShoppingCart className="text-xl hover:text-[#7ECB2A]" />
        {cartItems?.length > 0 && (
          <span className="absolute bg-[#7ECB2A] text-white px-1  rounded-2xl text-sm top-4 ml-[15px]">
            {cartItems?.length}
          </span>
        )}
      </>
    </Link>
  );
};

export default CartIcon;
