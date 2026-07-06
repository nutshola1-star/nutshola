// app/api/category/slug/[slug]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Category from "../../../../models/Category";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    
    const category = await Category.findOne({ slug });
    
    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }
    
    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category by slug error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch category",
        error: error.message,
      },
      { status: 500 },
    );
  }
}