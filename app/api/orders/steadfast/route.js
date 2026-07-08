// app/api/orders/steadfast/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Order from "../../../models/Order";

export async function POST(request) {
  try {
    // 1. Connect to the database
    await connectToDatabase();

    // 2. Get the order ID from the request body
    const { orderId } = await request.json();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // 3. Get API keys from environment variables
    const STEADFAST_API_KEY = process.env.STEADFAST_API_KEY;
    const STEADFAST_SECRET_KEY = process.env.STEADFAST_SECRET_KEY;

    if (!STEADFAST_API_KEY || !STEADFAST_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Server Configuration Error: Steadfast API keys are missing in .env.local",
        },
        { status: 500 },
      );
    }

    // 4. Format the address cleanly
    const fullAddress = `${order.customer.address}, ${
      order.customer.thana ? "P.S:" + order.customer.thana + ", " : ""
    }${order.customer.district}`;

    // 5. Map your Order model fields to Steadfast payload requirements
    const payload = {
      invoice: order.orderNumber,
      recipient_name: order.customer.name,
      recipient_phone: order.customer.phone,
      recipient_address: fullAddress,
      // Send total as COD amount if the order is Cash on Delivery.
      cod_amount: order.paymentMethod === "cod" ? order.total : 0,
      note: order.notes || "",
    };

    // 6. Make the request to Steadfast
    const response = await fetch(
      "https://portal.packzy.com/api/v1/create_order",
      {
        method: "POST",
        headers: {
          "Api-Key": STEADFAST_API_KEY,
          "Secret-Key": STEADFAST_SECRET_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    // 7. SAFELY parse the response to prevent JSON syntax crashes
    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // If it fails to parse, Steadfast sent a raw text error (e.g., "Account is inactive")
      console.error("Steadfast sent non-JSON response:", responseText);
      return NextResponse.json(
        {
          success: false,
          message: `Steadfast Error: ${responseText}`,
        },
        { status: 400 },
      );
    }

    // 8. Handle a successful response from Steadfast
    if (data.status === 200 && data.consignment) {
      const trackingCode = data.consignment.tracking_code;

      // Automatically save the tracking ID to your order in MongoDB
      order.shippingId = trackingCode;

      // Optional: Automatically bump the status to processing if it was pending
      if (order.status === "pending") {
        order.status = "processing";
      }

      await order.save();

      return NextResponse.json({
        success: true,
        trackingCode: trackingCode,
        message: "Order successfully sent to Steadfast!",
      });
    } else {
      // 9. Handle an API-level error from Steadfast (e.g., missing fields)
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Steadfast rejected the request",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Steadfast API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error connecting to courier",
      },
      { status: 500 },
    );
  }
}
