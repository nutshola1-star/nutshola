// app/api/slide-show/route.js

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../lib/mongodb";
import SlideImage from "../../models/SlideImage";
import { getCurrentUser } from "../../lib/authUtils";
import cloudinary from "../../lib/cloudinary";

// GET - Fetch all slides
export async function GET() {
  try {
    await connectToDatabase();
    
    const slides = await SlideImage.find({})
      .sort({ createdAt: -1 })
      .select("image link type isActive createdAt");

    return NextResponse.json({
      success: true,
      slides,
      count: slides.length,
    });
  } catch (error) {
    console.error("Get slides error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch slides",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Upload a new slide
export async function POST(request) {
  try {
    // 1. Authenticate - Allow role 1 and 2
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const currentUser = getCurrentUser(token);
    if (!currentUser || (currentUser.role !== 1 && currentUser.role !== 2)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized: Admin or Editor access required" 
        },
        { status: 403 },
      );
    }

    // 2. Get form data
    const formData = await request.formData();
    const image = formData.get("image");

    // 3. Validate
    if (!image) {
      return NextResponse.json(
        {
          success: false,
          message: "Image is required",
        },
        { status: 400 },
      );
    }

    // Check file size (max 10MB)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size must be less than 10MB",
        },
        { status: 400 },
      );
    }

    // 4. Connect to database
    await connectToDatabase();

    // 5. Check slide count (max 10)
    const slideCount = await SlideImage.countDocuments();
    if (slideCount >= 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum 10 slides allowed. Please delete some slides first.",
        },
        { status: 400 },
      );
    }

    // 6. Upload image to Cloudinary
    try {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = `data:${image.type};base64,${buffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "slideshow",
        width: 1920,
        height: 600,
        crop: "fill",
        quality: 85,
      });

      // 7. Save to database
      const slide = new SlideImage({
        image: result.secure_url,
        link: "",
        type: "main", // Default type
        isActive: true,
      });

      await slide.save();

      return NextResponse.json({
        success: true,
        message: "Slide uploaded successfully",
        slide: {
          _id: slide._id,
          image: slide.image,
          link: slide.link,
          type: slide.type,
          isActive: slide.isActive,
          createdAt: slide.createdAt,
        },
        totalSlides: slideCount + 1,
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to upload image: " + error.message,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Upload slide error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload slide",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete a slide
export async function DELETE(request) {
  try {
    // 1. Authenticate - Allow role 1 and 2
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const currentUser = getCurrentUser(token);
    if (!currentUser || (currentUser.role !== 1 && currentUser.role !== 2)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized: Admin or Editor access required" 
        },
        { status: 403 },
      );
    }

    // 2. Get slide ID
    const { searchParams } = new URL(request.url);
    const slideId = searchParams.get("id");

    if (!slideId) {
      return NextResponse.json(
        {
          success: false,
          message: "Slide ID is required",
        },
        { status: 400 },
      );
    }

    // 3. Connect to database
    await connectToDatabase();

    // 4. Find slide
    const slide = await SlideImage.findById(slideId);
    if (!slide) {
      return NextResponse.json(
        {
          success: false,
          message: "Slide not found",
        },
        { status: 404 },
      );
    }

    // 5. Delete image from Cloudinary
    try {
      // Extract public_id from URL
      const urlParts = slide.image.split("/");
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = `slideshow/${publicIdWithExtension.split(".")[0]}`;
      
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error);
      // Continue even if Cloudinary deletion fails
    }

    // 6. Delete from database
    await SlideImage.findByIdAndDelete(slideId);

    // 7. Get updated count
    const remainingSlides = await SlideImage.countDocuments();

    return NextResponse.json({
      success: true,
      message: "Slide deleted successfully",
      remainingSlides,
    });
  } catch (error) {
    console.error("Delete slide error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete slide",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// PUT - Toggle slide active status
export async function PUT(request) {
  try {
    // 1. Authenticate - Allow role 1 and 2
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const currentUser = getCurrentUser(token);
    if (!currentUser || (currentUser.role !== 1 && currentUser.role !== 2)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized: Admin or Editor access required" 
        },
        { status: 403 },
      );
    }

    // 2. Get data
    const { slideId, isActive } = await request.json();

    if (!slideId) {
      return NextResponse.json(
        {
          success: false,
          message: "Slide ID is required",
        },
        { status: 400 },
      );
    }

    // 3. Connect to database
    await connectToDatabase();

    // 4. Update slide
    const slide = await SlideImage.findByIdAndUpdate(
      slideId,
      { isActive },
      { new: true }
    );

    if (!slide) {
      return NextResponse.json(
        {
          success: false,
          message: "Slide not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Slide status updated successfully",
      slide,
    });
  } catch (error) {
    console.error("Update slide error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update slide",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// PATCH - Update slide link or type
export async function PATCH(request) {
  try {
    // 1. Authenticate - Allow role 1 and 2
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const currentUser = getCurrentUser(token);
    if (!currentUser || (currentUser.role !== 1 && currentUser.role !== 2)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized: Admin or Editor access required" 
        },
        { status: 403 },
      );
    }

    // 2. Get data
    const { slideId, link, type } = await request.json();

    if (!slideId) {
      return NextResponse.json(
        {
          success: false,
          message: "Slide ID is required",
        },
        { status: 400 },
      );
    }

    // 3. Build update object
    const updateData = {};
    if (link !== undefined) {
      if (link !== "" && !/^(https?:\/\/)/.test(link)) {
        return NextResponse.json(
          {
            success: false,
            message: "Link must be a valid URL or empty",
          },
          { status: 400 },
        );
      }
      updateData.link = link || "";
    }
    
    if (type !== undefined) {
      const validTypes = ['main', 'fixed-right-1', 'fixed-right-2'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid slide type",
          },
          { status: 400 },
        );
      }
      updateData.type = type;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid fields to update",
        },
        { status: 400 },
      );
    }

    // 4. Connect to database
    await connectToDatabase();

    // 5. Update slide
    const slide = await SlideImage.findByIdAndUpdate(
      slideId,
      updateData,
      { new: true }
    );

    if (!slide) {
      return NextResponse.json(
        {
          success: false,
          message: "Slide not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Slide updated successfully",
      slide,
    });
  } catch (error) {
    console.error("Update slide error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update slide",
        error: error.message,
      },
      { status: 500 },
    );
  }
}