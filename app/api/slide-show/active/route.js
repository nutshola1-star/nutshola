// app/api/slide-show/active/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import SlideImage from "../../../models/SlideImage";

// GET - Fetch only active slides for homepage
export async function GET() {
  try {
    await connectToDatabase();
    
    const slides = await SlideImage.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select("image link type isActive createdAt");

    return NextResponse.json({
      success: true,
      slides,
      count: slides.length,
    });
  } catch (error) {
    console.error("Get active slides error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch active slides",
        error: error.message,
      },
      { status: 500 },
    );
  }
}