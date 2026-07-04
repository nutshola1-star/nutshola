// app/api/product/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../lib/mongodb";
import Product from "../../models/Product";
import Category from "../../models/Category";
import { getCurrentUser } from "../../lib/authUtils";
import cloudinary from "../../lib/cloudinary";
import slugify from "slugify";

// GET - Fetch all products
export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({})
      .populate("category", "name bengaliName")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);
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

// Helper function to generate a unique 4-digit SKU
async function generateUniqueSKU() {
  // Find the latest product to get the highest SKU
  const latestProduct = await Product.findOne({})
    .sort({ SKU: -1 })
    .select("SKU");

  let nextNumber = 1000; // Start from 1000

  if (latestProduct && latestProduct.SKU) {
    // Extract the number from the SKU (assuming format like "1001")
    const skuNumber = parseInt(latestProduct.SKU);
    if (!isNaN(skuNumber)) {
      nextNumber = skuNumber + 1;
    }
  }

  // Ensure we don't exceed 9999
  if (nextNumber > 9999) {
    throw new Error("SKU limit reached. Maximum 9000 products allowed.");
  }

  return nextNumber.toString().padStart(4, "0");
}

// POST - Create a new product
export async function POST(request) {
  try {
    // 1. Authenticate
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const currentUser = getCurrentUser(token);
    if (!currentUser || currentUser.role !== 1) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    // 2. Get form data
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    // SKU is NOT received from frontend - we generate it automatically
    const photos = formData.getAll("photos");

    // 3. Validate
    if (!name || !description || !category) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, description, and category are required",
        },
        { status: 400 },
      );
    }

    // 4. Connect to database
    await connectToDatabase();

    // 5. Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    // 6. Parse pricing
    const pricingData = [];
    const pricingEntries = Array.from(formData.entries()).filter(([key]) =>
      key.startsWith("pricing["),
    );

    for (const [key, value] of pricingEntries) {
      const match = key.match(/pricing\[(\d+)\]\[(\w+)\]/);
      if (match) {
        const index = parseInt(match[1]);
        const field = match[2];
        if (!pricingData[index]) pricingData[index] = {};
        pricingData[index][field] =
          field === "weight" || field === "price" || field === "discountedPrice"
            ? parseFloat(value) || value
            : value;
      }
    }

    // Filter out empty pricing entries
    const pricing = pricingData.filter((p) => p.weight && p.price);

    if (pricing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one valid pricing option is required",
        },
        { status: 400 },
      );
    }

    // 7. Upload photos to Cloudinary
    const photoUrls = [];
    for (const photo of photos) {
      if (photo.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            message: "Photo size must be less than 10MB",
          },
          { status: 400 },
        );
      }

      try {
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${photo.type};base64,${buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(base64Image, {
          folder: "products",
          width: 800,
          crop: "limit",
          quality: 80,
        });

        photoUrls.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to upload photo: " + error.message,
          },
          { status: 500 },
        );
      }
    }

    if (photoUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one photo is required",
        },
        { status: 400 },
      );
    }

    // 8. Generate slug
    const slug = slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    // 9. Generate unique 4-digit SKU
    const SKU = await generateUniqueSKU();

    const isActive = formData.get("isActive") === "true";
    // 10. Create product

    const productData = {
      name,
      slug,
      description,
      category,
      pricing,
      SKU,
      photos: photoUrls,
      isActive: isActive !== undefined ? isActive : true, // Default to true if not provided
    };
    const product = new Product(productData);
    await product.save();

    const populatedProduct = await Product.findById(product._id).populate(
      "category",
      "name bengaliName",
    );

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// PUT - Update a product
export async function PUT(request) {
  try {
    // 1. Authenticate
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const currentUser = getCurrentUser(token);
    if (!currentUser || currentUser.role !== 1) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    // 2. Get form data
    const formData = await request.formData();
    const productId = formData.get("productId");
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const SKU = formData.get("SKU");
    const photos = formData.getAll("photos");
    const removePhotos = formData.getAll("removePhotos[]");

    // 3. Validate
    if (!productId || !name || !description || !category) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID, name, description, and category are required",
        },
        { status: 400 },
      );
    }

    // 4. Connect to database
    await connectToDatabase();

    // 5. Find existing product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    // 6. Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    // 7. Parse pricing
    const pricingData = [];
    const pricingEntries = Array.from(formData.entries()).filter(([key]) =>
      key.startsWith("pricing["),
    );

    for (const [key, value] of pricingEntries) {
      const match = key.match(/pricing\[(\d+)\]\[(\w+)\]/);
      if (match) {
        const index = parseInt(match[1]);
        const field = match[2];
        if (!pricingData[index]) pricingData[index] = {};
        pricingData[index][field] =
          field === "weight" || field === "price" || field === "discountedPrice"
            ? parseFloat(value) || value
            : value;
      }
    }

    const pricing = pricingData.filter((p) => p.weight && p.price);

    if (pricing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one valid pricing option is required",
        },
        { status: 400 },
      );
    }

    // 8. Handle photo removal
    let existingPhotos = product.photos;
    if (removePhotos && removePhotos.length > 0) {
      // Delete from Cloudinary
      for (const public_id of removePhotos) {
        try {
          await cloudinary.uploader.destroy(public_id);
        } catch (error) {
          console.error("Error deleting photo from Cloudinary:", error);
        }
      }
      // Remove from array
      existingPhotos = existingPhotos.filter(
        (p) => !removePhotos.includes(p.public_id),
      );
    }

    // 9. Upload new photos
    const newPhotos = [];
    for (const photo of photos) {
      if (photo.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            message: "Photo size must be less than 10MB",
          },
          { status: 400 },
        );
      }

      try {
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${photo.type};base64,${buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(base64Image, {
          folder: "products",
          width: 800,
          crop: "limit",
          quality: 80,
        });

        newPhotos.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to upload photo: " + error.message,
          },
          { status: 500 },
        );
      }
    }

    // 10. Combine photos
    const allPhotos = [...existingPhotos, ...newPhotos];

    if (allPhotos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one photo is required",
        },
        { status: 400 },
      );
    }

    // 11. Generate slug
    const slug = slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    const isActive = formData.get("isActive") === "true";
    // 12. Update product

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        slug,
        description,
        category,
        pricing,
        SKU: SKU || undefined,
        photos: allPhotos,
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true, runValidators: true },
    ).populate("category", "name bengaliName");

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete a product
export async function DELETE(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const currentUser = getCurrentUser(token);
    if (!currentUser || currentUser.role !== 1) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    // Delete all photos from Cloudinary
    for (const photo of product.photos) {
      if (photo.public_id) {
        try {
          await cloudinary.uploader.destroy(photo.public_id);
        } catch (error) {
          console.error("Error deleting photo from Cloudinary:", error);
        }
      }
    }

    await Product.findByIdAndDelete(productId);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
