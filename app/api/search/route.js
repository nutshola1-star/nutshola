// app/api/search/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../lib/mongodb";
import Product from "../../models/Product";
import Category from "../../models/Category";

// Helper function to highlight matching text
const highlightMatch = (text, query) => {
  if (!text || !query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark style="background-color: #7ECB2A; color: #3A393D; padding: 0 2px; border-radius: 2px;">$1</mark>');
};

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const sort = searchParams.get('sort') || 'relevance';
    const type = searchParams.get('type') || 'all';
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        products: [],
        suggestions: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalProducts: 0,
          perPage: limit,
        },
      });
    }

    const searchQuery = query.trim();
    const searchRegex = new RegExp(searchQuery, 'i');
    const skip = (page - 1) * limit;

    // Build search conditions for products
    const productConditions = [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { SKU: { $regex: searchRegex } },
    ];

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
        sortOptions = { createdAt: -1 };
        break;
      case 'relevance':
      default:
        sortOptions = { name: 1 };
        break;
    }

    // Get total count for pagination
    const filter = {
      $or: productConditions,
      isActive: true,
    };
    const totalProducts = await Product.countDocuments(filter);

    // Search for products with pagination
    let products = await Product.find(filter)
      .populate('category', 'name slug')
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
      .lean();

    // Format products for display (with pricing info)
    const formattedProducts = products.map((product) => {
      const hasDiscount = product.pricing?.some(p => p.discountedPrice && p.discountedPrice < p.price);
      const minPrice = product.pricing && product.pricing.length > 0 
        ? Math.min(...product.pricing.map(p => p.price))
        : null;
      const minDiscounted = product.pricing && product.pricing.length > 0 && hasDiscount
        ? Math.min(...product.pricing.map(p => p.discountedPrice || p.price))
        : null;

      return {
        ...product,
        displayPrice: minDiscounted || minPrice,
        hasDiscount: hasDiscount,
        originalPrice: minPrice,
      };
    });

    // Get suggestions for the dropdown (only on page 1)
    let suggestions = [];
    if (page === 1) {
      const suggestionProducts = await Product.find({
        $or: productConditions,
        isActive: true,
      })
        .populate('category', 'name')
        .limit(8)
        .lean();

      // Format product suggestions
      const productSuggestions = suggestionProducts.map((product) => {
        let matchType = 'general';
        if (product.name.match(searchRegex)) matchType = 'name';
        else if (product.SKU && product.SKU.match(searchRegex)) matchType = 'sku';
        else if (product.description && product.description.match(searchRegex)) matchType = 'description';
        
        let priceDisplay = 'N/A';
        if (product.pricing && product.pricing.length > 0) {
          const minPrice = Math.min(...product.pricing.map(p => p.price));
          const hasDiscount = product.pricing.some(p => p.discountedPrice && p.discountedPrice < p.price);
          if (hasDiscount) {
            const minDiscounted = Math.min(...product.pricing.map(p => p.discountedPrice || p.price));
            priceDisplay = `৳${minDiscounted}`;
          } else {
            priceDisplay = `৳${minPrice}`;
          }
        }

        return {
          _id: product._id,
          name: product.name,
          highlightedName: highlightMatch(product.name, searchQuery),
          slug: product.slug,
          SKU: product.SKU,
          thumbnail: product.photos?.[0]?.url || null,
          priceDisplay: priceDisplay,
          matchType: matchType,
          categoryName: product.category?.name || 'Uncategorized',
          type: 'product',
        };
      });

      // Search for categories
      const categories = await Category.find({
        $or: [
          { name: { $regex: searchRegex } },
          { bengaliName: { $regex: searchRegex } },
        ],
      })
        .limit(5)
        .lean();

      const categorySuggestions = categories.map((category) => ({
        _id: category._id,
        name: category.name,
        highlightedName: highlightMatch(category.name, searchQuery),
        bengaliName: category.bengaliName,
        slug: category.slug,
        matchType: 'category',
        type: 'category',
        image: category.image?.url || null,
      }));

      // Combine and sort suggestions
      suggestions = [...productSuggestions, ...categorySuggestions];
      suggestions.sort((a, b) => {
        const aWeight = a.matchType === 'name' ? 4 : a.matchType === 'category' ? 3 : a.matchType === 'sku' ? 2 : 1;
        const bWeight = b.matchType === 'name' ? 4 : b.matchType === 'category' ? 3 : b.matchType === 'sku' ? 2 : 1;
        return bWeight - aWeight;
      });
      suggestions = suggestions.slice(0, 8);
    }

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      suggestions: suggestions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts: totalProducts,
        perPage: limit,
      },
      query: searchQuery,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to search",
        error: error.message,
      },
      { status: 500 },
    );
  }
}