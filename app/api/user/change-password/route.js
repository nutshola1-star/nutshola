// app/api/user/change-password/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';
import { getCurrentUser, comparePassword, hashPassword } from '../../../lib/authUtils';

export async function POST(request) {
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

    // 4. Get password data
    const { currentPassword, newPassword } = await request.json();

    // 5. Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        message: 'Current password and new password are required'
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'New password must be at least 6 characters'
      }, { status: 400 });
    }

    // 6. Get user with password field
    const user = await User.findById(currentUser.userId).select('+password');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // 7. Verify current password
    const isValid = await comparePassword(currentPassword, user.password);
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: 'Current password is incorrect'
      }, { status: 401 });
    }

    // 8. Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // 9. Update password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    }, { status: 500 });
  }
}