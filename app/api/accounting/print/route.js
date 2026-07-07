// app/api/accounting/print/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Order from "../../../models/Order";
import { getCurrentUser } from "../../../lib/authUtils";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user
    const user = getCurrentUser(token);
    if (!user || (user.role !== 1 && user.role !== 2)) {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin access required." },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end);
    if (!startDate) {
      start.setDate(start.getDate() - 30);
    }

    // Build query
    const query = {
      createdAt: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
      status: { $nin: ["cancelled"] },
    };

    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate summary
    const summary = {
      totalOrders: orders.length,
      totalRevenue: 0,
      totalDiscount: 0,
      totalDeliveryCharge: 0,
      netRevenue: 0,
    };

    orders.forEach(order => {
      summary.totalRevenue += order.total || 0;
      summary.totalDiscount += order.discount || 0;
      summary.totalDeliveryCharge += order.deliveryCharge || 0;
    });

    summary.netRevenue = summary.totalRevenue - summary.totalDiscount;

    return NextResponse.json({
      success: true,
      data: {
        orders,
        summary,
        dateRange: {
          start,
          end,
        },
      },
    });
  } catch (error) {
    console.error("Print API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch print data", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}