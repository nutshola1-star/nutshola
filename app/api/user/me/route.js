// app/api/user/me/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/authUtils";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";

export async function GET(request) {
  try {
    // Get token from cookie or Authorization header
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    console.log("Token from cookie:", token ? "Present" : "Not present");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Verify token - this is now synchronous
    const decoded = getCurrentUser(token);

    console.log("Decoded token:", decoded);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get full user data
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        district: user.district,
        country: user.country,
        role: user.role,
        wishList: user.wishList || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get user data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}