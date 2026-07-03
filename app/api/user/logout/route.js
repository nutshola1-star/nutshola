// app/api/user/logout/route.js
import { NextResponse } from 'next/server';
import { removeAuthCookie } from '../../../lib/authUtils';

export async function POST() {
  try {
    // Remove cookie
    await removeAuthCookie();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Logout failed'
    }, { status: 500 });
  }
}