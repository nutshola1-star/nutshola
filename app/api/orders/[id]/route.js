// app/api/orders/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Order from "../../../models/Order";
import { getCurrentUser } from "../../../lib/authUtils";

// GET - Get single order
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    
    const order = await Order.findById(id)
      .populate("items.productId", "name slug photos SKU")
      .populate("userId", "name email phone")
      .lean();
    
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }
    
    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// PUT - Update order (Admin only: role 1 & 2)
export async function PUT(request, { params }) {
  try {
    // Authenticate - Allow role 1 and 2
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const currentUser = getCurrentUser(token);
    if (!currentUser || (currentUser.role !== 1 && currentUser.role !== 2)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Admin or Editor access required",
        },
        { status: 403 },
      );
    }
    
    const { id } = await params;
    const data = await request.json();
    
    await connectToDatabase();
    
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }
    
    // Update allowed fields
    const allowedFields = [
      "status", "shippingId", "notes", "paymentStatus", 
      "items", "subtotal", "discount", "deliveryCharge", "total"
    ];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        order[field] = data[field];
      }
    }
    
    // Update customer if provided
    if (data.customer) {
      order.customer = { ...order.customer, ...data.customer };
    }
    
    await order.save();
    
    const updatedOrder = await Order.findById(id)
      .populate("items.productId", "name slug photos")
      .lean();
    
    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete order (Admin only: role 1)
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
    
    await connectToDatabase();
    
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete order",
        error: error.message,
      },
      { status: 500 },
    );
  }
}