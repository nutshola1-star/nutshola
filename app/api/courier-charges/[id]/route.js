// app/api/courier-charges/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import CourierCharge from "../../../models/CourierCharge";
import { getCurrentUser } from "../../../lib/authUtils";

// PUT - Update a courier charge
export async function PUT(request, { params }) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Charge ID is required",
        },
        { status: 400 },
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

    // 5. Check for overlapping weight ranges (excluding current)
    const existingCharge = await CourierCharge.findOne({
      _id: { $ne: id },
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

    // 6. Update charge
    const charge = await CourierCharge.findByIdAndUpdate(
      id,
      {
        weightFrom,
        weightTo,
        insideDhaka,
        outsideDhaka,
      },
      { new: true, runValidators: true }
    );

    if (!charge) {
      return NextResponse.json(
        {
          success: false,
          message: "Courier charge not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Courier charge updated successfully",
      charge,
    });
  } catch (error) {
    console.error("Update courier charge error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update courier charge",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete a courier charge
export async function DELETE(request, { params }) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Charge ID is required",
        },
        { status: 400 },
      );
    }

    // 2. Connect to database
    await connectToDatabase();

    // 3. Delete charge
    const charge = await CourierCharge.findByIdAndDelete(id);

    if (!charge) {
      return NextResponse.json(
        {
          success: false,
          message: "Courier charge not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Courier charge deleted successfully",
    });
  } catch (error) {
    console.error("Delete courier charge error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete courier charge",
        error: error.message,
      },
      { status: 500 },
    );
  }
}