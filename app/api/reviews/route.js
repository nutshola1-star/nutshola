// app/api/reviews/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../lib/mongodb";
import Review from "../../models/Review";
import { getCurrentUser } from "../../lib/authUtils";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const limit = parseInt(searchParams.get("limit")) || 20;
    const sort = searchParams.get("sort") || "order";

    // Build query
    const query = {};
    if (active === "true") {
      query.isActive = true;
    } else if (active === "false") {
      query.isActive = false;
    }

    // Sort options
    let sortOption = {};
    if (sort === "rating") {
      sortOption = { rating: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else {
      sortOption = { order: 1, createdAt: -1 };
    }

    const reviews = await Review.find(query)
      .sort(sortOption)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reviews",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// Add this POST method to app/api/reviews/route.js

export async function POST(request) {
  try {
    await connectToDatabase();

    // Check authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = getCurrentUser(token);
    if (!user || (user.role !== 1 && user.role !== 2)) {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin access required." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      reviewerName,
      reviewerDistrict,
      rating,
      reviewText,
      isActive,
      order,
    } = body;

    // Validate required fields
    if (!reviewerName || !reviewerDistrict || !rating || !reviewText) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    const review = new Review({
      reviewerName,
      reviewerDistrict,
      rating,
      reviewText,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    await review.save();

    return NextResponse.json({
      success: true,
      data: review,
      message: "Review added successfully",
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create review",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
