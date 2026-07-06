// app/api/courier-charges/calculate/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import CourierCharge from "../../../models/CourierCharge";

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { weight, isInsideDhaka } = await request.json();

    if (weight === undefined || weight === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Weight is required",
        },
        { status: 400 },
      );
    }

    if (weight < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Weight cannot be negative",
        },
        { status: 400 },
      );
    }

    // Get the base rate (highest weight range, typically up to 4kg)
    // Find all charges sorted by weightFrom descending to get the highest range
    const allCharges = await CourierCharge.find({})
      .sort({ weightFrom: -1 })
      .lean();

    if (!allCharges || allCharges.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No courier charges configured",
          charge: 0,
        },
        { status: 404 },
      );
    }

    // Get the highest weight range (the base rate)
    const baseCharge = allCharges[0];
    const maxWeight = baseCharge.weightTo;

    let deliveryCharge = 0;
    let weightRange = '';
    let extraWeight = 0;

    // Check if weight is within existing ranges
    const exactMatch = await CourierCharge.findOne({
      weightFrom: { $lte: weight },
      weightTo: { $gte: weight },
    });

    if (exactMatch) {
      // Weight is within existing range
      deliveryCharge = isInsideDhaka ? exactMatch.insideDhaka : exactMatch.outsideDhaka;
      weightRange = `${exactMatch.weightFrom} - ${exactMatch.weightTo} KG`;
    } else if (weight > maxWeight) {
      // Weight exceeds maximum range - calculate extra charge
      // Get the base rate (highest range charge)
      const baseRate = isInsideDhaka ? baseCharge.insideDhaka : baseCharge.outsideDhaka;
      
      // Calculate how many extra kg beyond maxWeight
      extraWeight = weight - maxWeight;
      
      // For every full kg or part thereof, add 20 taka
      const extraCharge = Math.ceil(extraWeight) * 20;
      
      deliveryCharge = baseRate + extraCharge;
      weightRange = `${maxWeight} KG + ${extraWeight.toFixed(2)} KG extra`;
    } else {
      // Weight doesn't match any range (shouldn't happen if data is complete)
      return NextResponse.json(
        {
          success: false,
          message: "No courier charge found for this weight range",
          charge: 0,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      charge: deliveryCharge,
      weightRange: weightRange,
      location: isInsideDhaka ? "Inside Dhaka" : "Outside Dhaka",
      extraWeight: extraWeight || 0,
      extraCharge: extraWeight > 0 ? Math.ceil(extraWeight) * 20 : 0,
    });
  } catch (error) {
    console.error("Calculate courier charge error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to calculate courier charge",
        error: error.message,
      },
      { status: 500 },
    );
  }
}