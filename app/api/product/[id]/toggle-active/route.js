// app/api/product/[id]/toggle-active/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Product from "../../../../models/Product";
import { getCurrentUser } from "../../../../lib/authUtils";

export async function PATCH(request, props) {
  try {
    // 1. Authenticate (Ensure the user is an admin)
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const currentUser = getCurrentUser(token);
    if (!currentUser || currentUser.role !== 1) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // 2. Await the params promise and get the product ID
    const params = await props.params;
    const productId = params.id;

    // 3. Parse the JSON body sent from the frontend
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 400 }
      );
    }

    // 4. Connect to DB and update the product
    await connectToDatabase();

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { isActive },
      { new: true } // Returns the updated document
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // 5. Return success response
    return NextResponse.json({
      success: true,
      message: `Product ${isActive ? "activated" : "deactivated"} successfully`,
      product: updatedProduct,
    });

  } catch (error) {
    console.error("Toggle active error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}