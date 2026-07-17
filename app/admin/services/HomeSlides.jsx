// app/admin/services/HomeSlides.jsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaUpload, FaTrash, FaSpinner, FaLink } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

// Shimmer loading component
const SlideShimmer = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-gray-100 rounded-lg overflow-hidden shadow-md animate-pulse">
        <div className="relative h-48 w-full bg-gray-200"></div>
        <div className="absolute top-2 right-2">
          <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
        </div>
        <div className="absolute top-2 left-2">
          <div className="w-8 h-6 bg-gray-300 rounded-full"></div>
        </div>
        <div className="absolute bottom-2 left-2">
          <div className="w-20 h-5 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

// Toggle Switch Component
const ToggleSwitch = ({ isActive, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#559F34] focus:ring-offset-2 ${
        isActive ? 'bg-[#559F34]' : 'bg-gray-300'
      }`}
      role="switch"
      aria-checked={isActive}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          isActive ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

// Link Input Component
const LinkInput = ({ slideId, currentLink, onUpdate }) => {
  const [link, setLink] = useState(currentLink || '');
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleSave = async () => {
    setUpdating(true);
    try {
      const res = await fetch('/api/slide-show', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slideId,
          link: link.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Link updated successfully!');
        onUpdate(slideId, link.trim());
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Failed to update link');
      }
    } catch (error) {
      toast.error('Error updating link: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <FaLink className="text-gray-400 text-xs" />
        <span className="text-xs text-gray-500 truncate max-w-[120px]">
          {currentLink || 'No link'}
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-[#559F34] hover:text-[#45802A] ml-auto"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <input
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Enter URL (leave empty for no link)"
        className="flex-1 text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#559F34]"
        disabled={updating}
        autoFocus
      />
      <button
        onClick={handleSave}
        disabled={updating}
        className="text-xs bg-[#559F34] text-white px-2 py-1 rounded hover:bg-[#45802A] disabled:opacity-50"
      >
        {updating ? <FaSpinner className="animate-spin" /> : 'Save'}
      </button>
      <button
        onClick={() => {
          setIsEditing(false);
          setLink(currentLink || '');
        }}
        disabled={updating}
        className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
};

// Type Badge Component
const TypeBadge = ({ type }) => {
  const typeColors = {
    'main': 'bg-blue-500',
    'fixed-right-1': 'bg-purple-500',
    'fixed-right-2': 'bg-pink-500',
  };
  
  const typeLabels = {
    'main': 'Main Slide',
    'fixed-right-1': 'Fixed Right 1',
    'fixed-right-2': 'Fixed Right 2',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${typeColors[type] || 'bg-gray-500'}`}>
      {typeLabels[type] || type}
    </span>
  );
};

const HomeSlides = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [changingTypeId, setChangingTypeId] = useState(null);
  const { user } = useAuth();

  // Check if user has admin/editor role (role 1 or 2)
  const isAdmin = user?.role === 1 || user?.role === 2;

  // Fetch slides
  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/slide-show');
      const data = await res.json();
      
      if (data.success) {
        setSlides(data.slides);
      } else {
        toast.error(data.message || 'Failed to fetch slides');
      }
    } catch (error) {
      toast.error('Error fetching slides: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //eslint-disable-next-line
    fetchSlides();
  }, []);

  // Upload slide
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if max slides reached
    if (slides.length >= 10) {
      toast.error('Maximum 10 slides allowed. Please delete some slides first.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading('Uploading slide...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/slide-show', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success('Slide uploaded successfully!');
        await fetchSlides();
        e.target.value = '';
      } else {
        toast.error(data.message || 'Failed to upload slide');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error uploading slide: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Delete slide
  const handleDelete = async (slideId) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    setDeletingId(slideId);
    const loadingToast = toast.loading('Deleting slide...');

    try {
      const res = await fetch(`/api/slide-show?id=${slideId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success('Slide deleted successfully!');
        await fetchSlides();
      } else {
        toast.error(data.message || 'Failed to delete slide');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error deleting slide: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle slide active status
  const handleToggleActive = async (slideId, currentStatus) => {
    setTogglingId(slideId);
    const loadingToast = toast.loading('Updating slide status...');

    try {
      const res = await fetch('/api/slide-show', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slideId,
          isActive: !currentStatus,
        }),
      });

      const data = await res.json();

      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success(`Slide ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        await fetchSlides();
      } else {
        toast.error(data.message || 'Failed to update slide status');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error updating slide: ' + error.message);
    } finally {
      setTogglingId(null);
    }
  };

  // Change slide type
  const handleChangeType = async (slideId, newType) => {
    setChangingTypeId(slideId);
    const loadingToast = toast.loading('Updating slide type...');

    try {
      const res = await fetch('/api/slide-show', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slideId,
          type: newType,
        }),
      });

      const data = await res.json();

      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success(`Slide type updated successfully!`);
        await fetchSlides();
      } else {
        toast.error(data.message || 'Failed to update slide type');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error updating slide type: ' + error.message);
    } finally {
      setChangingTypeId(null);
    }
  };

  // Handle link update
  const handleLinkUpdate = (slideId, newLink) => {
    setSlides(prevSlides =>
      prevSlides.map(slide =>
        slide._id === slideId
          ? { ...slide, link: newLink }
          : slide
      )
    );
  };

  // Get type options for dropdown
  const getTypeOptions = () => {
    const options = [
      { value: 'main', label: 'Main Slide' },
      { value: 'fixed-right-1', label: 'Fixed Right 1' },
      { value: 'fixed-right-2', label: 'Fixed Right 2' },
    ];
    return options;
  };

  // Show loading shimmer
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#559F34',
                color: '#fff',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
          }}
        />
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <SlideShimmer />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#559F34',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          },
          loading: {
            style: {
              background: '#3B82F6',
              color: '#fff',
            },
          },
        }}
      />
      
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#3A393D]">Slideshow Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            {slides.length} / 10 slides used
          </p>
        </div>
        
        {isAdmin && slides.length < 10 && (
          <label className={`cursor-pointer bg-[#559F34] hover:bg-[#45802A] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
            <FaUpload />
            Upload Slide
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {/* Slides Grid */}
      {slides.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No slides uploaded yet</p>
          {isAdmin && (
            <p className="text-sm text-gray-400 mt-2">
              Click {'"Upload Slide"'} to add your first slide
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide, index) => (
            <div
              key={slide._id}
              className="relative group bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 w-full">
                <Image
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    slide.isActive
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {slide.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Type Badge */}
              <div className="absolute top-12 right-2">
                <TypeBadge type={slide.type || 'main'} />
              </div>

              {/* Index Badge */}
              <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                #{index + 1}
              </div>

              {/* Date */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                {new Date(slide.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>

              {/* Admin Controls */}
              {isAdmin && (
                <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 bg-black/50 backdrop-blur-sm p-2 rounded-lg min-w-[160px]">
                  {/* Type Selector */}
                  <div className="flex items-center gap-2 w-full">
                    <select
                      value={slide.type || 'main'}
                      onChange={(e) => handleChangeType(slide._id, e.target.value)}
                      disabled={changingTypeId === slide._id}
                      className="text-xs bg-white/90 text-gray-800 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-[#559F34] disabled:opacity-50"
                    >
                      {getTypeOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {changingTypeId === slide._id && (
                      <FaSpinner className="animate-spin text-white text-sm" />
                    )}
                  </div>
                  
                  {/* Link Section */}
                  <LinkInput
                    slideId={slide._id}
                    currentLink={slide.link || ''}
                    onUpdate={handleLinkUpdate}
                  />
                  
                  {/* Controls Row */}
                  <div className="flex items-center gap-2 w-full justify-end">
                    {/* Toggle Switch */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-white font-medium">
                        {slide.isActive ? 'ON' : 'OFF'}
                      </span>
                      {togglingId === slide._id ? (
                        <FaSpinner className="animate-spin text-white text-sm" />
                      ) : (
                        <ToggleSwitch
                          isActive={slide.isActive}
                          onToggle={() => handleToggleActive(slide._id, slide.isActive)}
                        />
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(slide._id)}
                      disabled={deletingId === slide._id}
                      className="p-1.5 rounded-md bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white transition-colors"
                      title="Delete slide"
                    >
                      {deletingId === slide._id ? (
                        <FaSpinner className="animate-spin text-sm" />
                      ) : (
                        <FaTrash className="text-sm" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Max slides reached message */}
      {slides.length >= 10 && isAdmin && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 flex items-center gap-2">
          <span>⚠️</span>
          <span>Maximum 10 slides reached. Please delete some slides to upload new ones.</span>
        </div>
      )}
    </div>
  );
};

export default HomeSlides;