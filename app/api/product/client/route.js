// app/api/product/client/route.js

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Product from "../../../models/Product";
import Category from "../../../models/Category";

// GET - Fetch products with filtering, sorting, and pagination
export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { isActive: true };
    
    // Category filter
    if (category) {
      filter.category = category;
    }
    
    // Price range filter - checking pricing array for any price in range
    if (minPrice || maxPrice) {
      filter['pricing'] = {
        $elemMatch: {}
      };
      if (minPrice) filter['pricing'].$elemMatch.price = { $gte: parseInt(minPrice) };
      if (maxPrice) {
        if (filter['pricing'].$elemMatch.price) {
          filter['pricing'].$elemMatch.price.$lte = parseInt(maxPrice);
        } else {
          filter['pricing'].$elemMatch.price = { $lte: parseInt(maxPrice) };
        }
      }
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { SKU: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    let sortOptions = {};
    switch (sort) {
      case 'price_asc':
        // Sort by minimum price in pricing array
        sortOptions = { 'pricing.price': 1 };
        break;
      case 'price_desc':
        sortOptions = { 'pricing.price': -1 };
        break;
      case 'name_asc':
        sortOptions = { name: 1 };
        break;
      case 'name_desc':
        sortOptions = { name: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }
    
    // Get products with pagination and populate category
    const products = await Product.find(filter)
      .populate('category', 'name')
      .skip(skip)
      .limit(limit)
      .select('name slug pricing category SKU photos description createdAt isActive')
      .sort(sortOptions)
      .lean();
    
    // Get total count for pagination info
    const totalProducts = await Product.countDocuments(filter);
    
    return NextResponse.json(
      {
        success: true,
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts,
          perPage: limit,
        },
      },
      { status: 200 },
    );
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
        error: error.message,
      },
      { status: 500 },
    );
  }
}