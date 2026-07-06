// app/api/orders/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../lib/mongodb";
import Order from "../../models/Order";
import Product from "../../models/Product";
import { getCurrentUser } from "../../lib/authUtils";

// GET - Fetch orders with pagination and search
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "-createdAt";
    
    const skip = (page - 1) * limit;
    
    // Build search query
    const query = {};
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
        { shippingId: { $regex: search, $options: "i" } },
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    // Get orders with pagination
    const orders = await Order.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        perPage: limit,
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Create a new order
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ["customer", "items", "subtotal", "total"];
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
    
    // Validate customer fields
    const customerFields = ["name", "phone", "address", "district"];
    for (const field of customerFields) {
      if (!data.customer[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `Customer ${field} is required`,
          },
          { status: 400 },
        );
      }
    }
    
    // Validate items
    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one item is required",
        },
        { status: 400 },
      );
    }
    
    // Generate unique order number
    const orderNumber = await Order.generateOrderNumber();
    
    // Create order
    const order = new Order({
      orderNumber,
      customer: data.customer,
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount || 0,
      coupon: data.coupon || null,
      deliveryCharge: data.deliveryCharge || 0,
      totalWeight: data.totalWeight || 0,
      total: data.total,
      status: data.status || "pending",
      shippingId: data.shippingId || "",
      notes: data.notes || "",
      userId: data.userId || null,
      orderDate: data.orderDate || new Date(),
      paymentMethod: data.paymentMethod || "cod",
      paymentStatus: data.paymentStatus || "pending",
    });
    
    await order.save();
    
    // Populate product details
    const populatedOrder = await Order.findById(order._id)
      .populate("items.productId", "name slug photos")
      .lean();
    
    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: error.message,
      },
      { status: 500 },
    );
  }
}