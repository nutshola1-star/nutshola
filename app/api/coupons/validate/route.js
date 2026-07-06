// app/api/coupons/validate/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Coupon from "../../../models/Coupon";
import { getCurrentUser } from "../../../lib/authUtils";

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { code, amount, userId } = await request.json();

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code is required",
        },
        { status: 400 },
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid purchase amount is required",
        },
        { status: 400 },
      );
    }

    // Find the coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon code",
        },
        { status: 404 },
      );
    }

    // Check if coupon is valid (not expired, not exceeded usage limit)
    if (!coupon.isValid()) {
      let message = "Coupon is no longer valid";
      if (coupon.expiryDate && coupon.expiryDate < new Date()) {
        message = "Coupon has expired";
      } else if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        message = "Coupon usage limit has been reached";
      } else if (!coupon.isActive) {
        message = "Coupon is not active";
      }
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 400 },
      );
    }

    // Check minimum purchase requirement
    if (amount < coupon.minPurchase) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum purchase of ৳${coupon.minPurchase} required`,
          minPurchase: coupon.minPurchase,
        },
        { status: 400 },
      );
    }

    // Check per user limit if userId is provided
    if (userId && coupon.perUserLimit) {
      const userUsage = coupon.usedBy.filter(
        (entry) => entry.userId && entry.userId.toString() === userId
      );
      if (userUsage.length >= coupon.perUserLimit) {
        return NextResponse.json(
          {
            success: false,
            message: `You have already used this coupon ${coupon.perUserLimit} time(s)`,
          },
          { status: 400 },
        );
      }
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(amount);

    return NextResponse.json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discount: discount,
        description: coupon.description,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        discountDisplay: coupon.type === 'percentage' 
          ? `${coupon.percentage}% off`
          : `৳${coupon.amount} off`,
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to validate coupon",
        error: error.message,
      },
      { status: 500 },
    );
  }
}