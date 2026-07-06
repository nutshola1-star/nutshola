// app/api/coupons/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Coupon from "../../../models/Coupon";
import { getCurrentUser } from "../../../lib/authUtils";

// GET - Get a single coupon by ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error("Get coupon error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch coupon",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// PUT - Update a coupon (Admin only)
export async function PUT(request, { params }) {
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

    const { id } = await params;
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon ID is required",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Check if coupon exists
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 },
      );
    }

    // Check if code is being changed and if it already exists
    if (data.code && data.code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: data.code.toUpperCase(),
        _id: { $ne: id },
      });
      if (existingCoupon) {
        return NextResponse.json(
          {
            success: false,
            message: "Coupon code already exists",
          },
          { status: 400 },
        );
      }
    }

    // Update coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      {
        code: data.code ? data.code.toUpperCase() : coupon.code,
        type: data.type || coupon.type,
        amount: data.amount !== undefined ? data.amount : coupon.amount,
        percentage: data.percentage !== undefined ? data.percentage : coupon.percentage,
        maxDiscount: data.maxDiscount !== undefined ? data.maxDiscount : coupon.maxDiscount,
        minPurchase: data.minPurchase !== undefined ? data.minPurchase : coupon.minPurchase,
        usageLimit: data.usageLimit !== undefined ? data.usageLimit : coupon.usageLimit,
        perUserLimit: data.perUserLimit !== undefined ? data.perUserLimit : coupon.perUserLimit,
        startDate: data.startDate ? new Date(data.startDate) : coupon.startDate,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : coupon.expiryDate,
        isActive: data.isActive !== undefined ? data.isActive : coupon.isActive,
        description: data.description !== undefined ? data.description : coupon.description,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update coupon",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete a coupon (Admin only)
export async function DELETE(request, { params }) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon ID is required",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete coupon",
        error: error.message,
      },
      { status: 500 },
    );
  }
}