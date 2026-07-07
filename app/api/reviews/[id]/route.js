// app/api/reviews/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Review from "../../../models/Review";
import { getCurrentUser } from "../../../lib/authUtils";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const review = await Review.findById(id).lean();
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch review", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    // Check authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = getCurrentUser(token);
    if (!user || (user.role !== 1 && user.role !== 2)) {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reviewerName, reviewerDistrict, rating, reviewText, isActive, order } = body;

    // Validate required fields
    if (!reviewerName || !reviewerDistrict || !rating || !reviewText) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    // Update review
    review.reviewerName = reviewerName;
    review.reviewerDistrict = reviewerDistrict;
    review.rating = rating;
    review.reviewText = reviewText;
    if (isActive !== undefined) review.isActive = isActive;
    if (order !== undefined) review.order = order;

    await review.save();

    return NextResponse.json({
      success: true,
      data: review,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update review", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    // Check authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = getCurrentUser(token);
    if (!user || (user.role !== 1 && user.role !== 2)) {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin access required." },
        { status: 403 }
      );
    }

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    await review.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete review", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}