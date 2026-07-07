// app/api/track-order/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../lib/mongodb"; // Changed this line
import Order from "../../models/Order";

export async function POST(request) {
  try {
    await connectToDatabase(); // Changed this line

    const { searchType, searchValue } = await request.json();

    if (!searchValue || !searchType) {
      return NextResponse.json(
        { success: false, message: "Search type and value are required" },
        { status: 400 }
      );
    }

    let query = {};
    let results = [];

    if (searchType === "order") {
      // Search by order number (exact match)
      query = { orderNumber: searchValue.toUpperCase().trim() };
      const order = await Order.findOne(query).lean();
      if (!order) {
        return NextResponse.json(
          { success: false, message: "Order not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: order,
        message: "Order found successfully",
      });
    } else if (searchType === "phone") {
      // Search by phone number (partial match)
      const phoneRegex = new RegExp(searchValue.trim(), "i");
      query = { "customer.phone": phoneRegex };
      
      results = await Order.find(query)
        .sort({ createdAt: -1 })
        .lean();

      if (results.length === 0) {
        return NextResponse.json(
          { success: false, message: "No orders found for this phone number" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: results,
        message: `Found ${results.length} order(s)`,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid search type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to search orders", error: error.message },
      { status: 500 }
    );
  }
}