// app/api/coupons/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../lib/mongodb";
import Coupon from "../../models/Coupon";
import { getCurrentUser } from "../../lib/authUtils";

// GET - Fetch all coupons
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const type = searchParams.get("type");
    const code = searchParams.get("code");
    
    // Build query
    const query = {};
    if (isActive !== null) query.isActive = isActive === "true";
    if (type) query.type = type;
    if (code) query.code = code.toUpperCase();
    
    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      coupons,
      count: coupons.length,
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch coupons",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Create a new coupon (Admin only)
export async function POST(request) {
  try {
    // Authenticate - Only role 1 (Admin)
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const currentUser = getCurrentUser(token);
    if (!currentUser || currentUser.role !== 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Admin access required",
        },
        { status: 403 },
      );
    }

    // Get data
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['code', 'type', 'minPurchase', 'startDate', 'expiryDate'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required`,
          },
          { status: 400 },
        );
      }
    }

    // Validate based on type
    if (data.type === 'fixed' && !data.amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Amount is required for fixed discount coupons",
        },
        { status: 400 },
      );
    }

    if (data.type === 'percentage' && !data.percentage) {
      return NextResponse.json(
        {
          success: false,
          message: "Percentage is required for percentage discount coupons",
        },
        { status: 400 },
      );
    }

    // Check if coupon code already exists
    await connectToDatabase();
    const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code already exists",
        },
        { status: 400 },
      );
    }

    // Create coupon
    const coupon = new Coupon({
      code: data.code.toUpperCase(),
      type: data.type,
      amount: data.amount || null,
      percentage: data.percentage || null,
      maxDiscount: data.maxDiscount || null,
      minPurchase: data.minPurchase || 0,
      usageLimit: data.usageLimit || null,
      perUserLimit: data.perUserLimit || 1,
      startDate: new Date(data.startDate),
      expiryDate: new Date(data.expiryDate),
      isActive: data.isActive !== undefined ? data.isActive : true,
      description: data.description || "",
    });

    await coupon.save();

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create coupon",
        error: error.message,
      },
      { status: 500 },
    );
  }
}