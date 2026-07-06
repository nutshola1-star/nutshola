// app/api/product/client/route.js - Updated version

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
    
    console.log("=== Product API Debug ===");
    console.log("Received category param:", category);
    console.log("Category param type:", typeof category);
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { isActive: true };
    
    // Category filter
    if (category) {
      // Check if category is a valid ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(category);
      console.log("Is valid ObjectId?", isValidObjectId);
      
      let categoryId;
      
      if (isValidObjectId) {
        // It's an ID - use it directly
        categoryId = category;
        console.log("Using category ID directly:", categoryId);
      } else {
        // It's a slug - find the category by slug
        console.log("Looking up category by slug:", category);
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          categoryId = categoryDoc._id;
          console.log("Found category:", categoryDoc.name, "with ID:", categoryId);
        } else {
          console.log("Category not found for slug:", category);
          return NextResponse.json({
            success: true,
            products: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalProducts: 0,
              perPage: limit,
            },
          });
        }
      }
      
      filter.category = categoryId;
      console.log("Final category filter:", filter.category);
    }
    
    // Price range filter
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
    
    console.log("Final filter:", JSON.stringify(filter, null, 2));
    
    // Build sort object
    let sortOptions = {};
    switch (sort) {
      case 'price_asc':
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
    
    console.log(`Found ${products.length} products`);
    
    // Get total count for pagination info
    const totalProducts = await Product.countDocuments(filter);
    console.log(`Total products matching filter: ${totalProducts}`);
    
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