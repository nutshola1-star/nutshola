// app/api/product/[slug]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Product from "../../../../models/Product";
import Category from "../../../../models/Product";

// GET - Fetch a single product by slug
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    
    // Find product by slug and populate category
    const product = await Product.findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .lean();
    
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }
    
    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
        error: error.message,
      },
      { status: 500 },
    );
  }
}