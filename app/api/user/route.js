// app/api/user/route.js

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../lib/mongodb";
import User from "../../models/User";

export async function GET(request) {
  try {
    await connectToDatabase();
    const users = await User.find().select("-password"); // Exclude password field
    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
