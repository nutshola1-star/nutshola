// app/api/user/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';
import { getCurrentUser } from '../../../lib/authUtils';

export async function PUT(request, { params }) {
  try {
    // 1. Get token from cookie
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }

    // 2. Verify token
    const currentUser = getCurrentUser(token);
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }

    // 3. Connect to database
    await connectToDatabase();
    
    // 4. Get the userId from params
    const userId = params?.id || (await params)?.id;
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // 5. Authorize: Only the account owner or an admin (role 1) can edit
    if (currentUser.userId !== userId && currentUser.role !== 1) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to edit this user'
      }, { status: 403 });
    }

    // 6. Parse incoming data
    const body = await request.json();
    // NOTE: Password is NOT included here - it has its own route
    const { name, phone, address, district, country } = body;

    // 7. Build the update object dynamically (only allowed fields)
    let updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (district !== undefined) updateData.district = district;
    if (country !== undefined) updateData.country = country;

    // 8. Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid fields to update'
      }, { status: 400 });
    }

    // 9. Update user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        district: updatedUser.district,
        country: updatedUser.country,
        role: updatedUser.role,
        wishList: updatedUser.wishList || [],
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Update failed',
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // 1. Get token from cookie
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }

    // 2. Verify token
    const currentUser = getCurrentUser(token);
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }

    // 3. Connect to database
    await connectToDatabase();
    
    // 4. Get the userId from params
    const userId = params?.id || (await params)?.id;

    // 5. Authorize: Only the account owner or an admin (role 1) can delete
    if (currentUser.userId !== userId && currentUser.role !== 1) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to delete this user'
      }, { status: 403 });
    }

    // 6. Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Deletion error:', error);
    return NextResponse.json({
      success: false,
      message: 'Deletion failed',
      error: error.message
    }, { status: 500 });
  }
}