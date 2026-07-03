// app/api/user/login/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';
import { comparePassword, generateToken, setAuthCookie } from '../../../lib/authUtils';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }
    
    // Check if user is active (optional - you can add an 'active' field)
    // if (!user.active) {
    //   return NextResponse.json({
    //     success: false,
    //     message: 'Account is deactivated. Please contact support.'
    //   }, { status: 401 });
    // }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }
    
    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);
    
    // Set cookie
    await setAuthCookie(token);
    
    // Return user data (excluding password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      district: user.district,
      country: user.country,
      role: user.role,
      wishList: user.wishList || []
    };
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}