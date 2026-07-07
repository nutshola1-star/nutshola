// app/login/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';

export default function LoginClient() {
  const { login, loading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Redirect admin to dashboard, regular users to home
      if (user?.role === 1) {
        router.push('/admin/profile');
      } else {
        router.push('/');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (!result?.success) {
      setError(result?.message || 'Login failed. Please try again.');
    } else {
      // Redirect based on role
      if (result.user?.role === 1) {
        router.push('/admin/profile');
      } else {
        router.push('/');
      }
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#559F34' }}></div>
      </div>
    );
  }

  // Don't show login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#559F34' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo/Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#7ECB2A' }}>
            <FaUser className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#3A393D' }}>
            Welcome Back
          </h2>
          <p className="mt-2" style={{ color: '#3A393D' }}>
            Sign in to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#3A393D' }}>
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope style={{ color: '#3A393D' }} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: '#3A393D',
                  color: '#3A393D',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7ECB2A';
                  e.target.style.boxShadow = '0 0 0 2px rgba(126, 203, 42, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#3A393D';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#3A393D' }}>
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock style={{ color: '#3A393D' }} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: '#3A393D',
                  color: '#3A393D',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7ECB2A';
                  e.target.style.boxShadow = '0 0 0 2px rgba(126, 203, 42, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#3A393D';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              backgroundColor: '#7ECB2A',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#559F34';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#7ECB2A';
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <FaArrowRight className="text-sm" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}