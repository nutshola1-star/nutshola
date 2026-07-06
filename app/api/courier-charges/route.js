// app/api/courier-charges/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../lib/mongodb";
import CourierCharge from "../../models/CourierCharge";
import { getCurrentUser } from "../../lib/authUtils";

// GET - Fetch all courier charges
export async function GET() {
  try {
    await connectToDatabase();
    
    const charges = await CourierCharge.find({})
      .sort({ weightFrom: 1 });

    return NextResponse.json({
      success: true,
      charges,
    });
  } catch (error) {
    console.error("Get courier charges error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch courier charges",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Create a new courier charge
export async function POST(request) {
  try {
    // 1. Authenticate - Allow role 1 and 2
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

    // 2. Get data
    const { weightFrom, weightTo, insideDhaka, outsideDhaka } = await request.json();

    // 3. Validate
    if (weightFrom === undefined || weightTo === undefined || insideDhaka === undefined || outsideDhaka === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 },
      );
    }

    if (weightFrom < 0 || weightTo < 0 || insideDhaka < 0 || outsideDhaka < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Values cannot be negative",
        },
        { status: 400 },
      );
    }

    if (weightFrom >= weightTo) {
      return NextResponse.json(
        {
          success: false,
          message: "Ending weight must be greater than starting weight",
        },
        { status: 400 },
      );
    }

    // 4. Connect to database
    await connectToDatabase();

    // 5. Check for overlapping weight ranges
    const existingCharge = await CourierCharge.findOne({
      $or: [
        { weightFrom: { $lt: weightTo, $gte: weightFrom } },
        { weightTo: { $gt: weightFrom, $lte: weightTo } },
        { weightFrom: { $lte: weightFrom }, weightTo: { $gte: weightTo } },
      ],
    });

    if (existingCharge) {
      return NextResponse.json(
        {
          success: false,
          message: "Weight range overlaps with existing charges",
        },
        { status: 400 },
      );
    }

    // 6. Create charge
    const charge = new CourierCharge({
      weightFrom,
      weightTo,
      insideDhaka,
      outsideDhaka,
    });

    await charge.save();

    return NextResponse.json({
      success: true,
      message: "Courier charge created successfully",
      charge,
    });
  } catch (error) {
    console.error("Create courier charge error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create courier charge",
        error: error.message,
      },
      { status: 500 },
    );
  }
}