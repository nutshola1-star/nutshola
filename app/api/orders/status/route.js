// app/api/orders/status/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Order from "../../../models/Order";
import { getCurrentUser } from "../../../lib/authUtils";

export async function PATCH(request) {
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
    
    const { orderId, status, shippingId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required",
        },
        { status: 400 },
      );
    }
    
    await connectToDatabase();
    
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }
    
    // Update status
    if (status) {
      order.status = status;
    }
    
    // Update shipping ID
    if (shippingId !== undefined) {
      order.shippingId = shippingId;
    }
    
    await order.save();
    
    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        shippingId: order.shippingId,
      },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order status",
        error: error.message,
      },
      { status: 500 },
    );
  }
}