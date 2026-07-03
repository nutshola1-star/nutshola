// app/api/category/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';
import Category from '../../models/Category';
import { getCurrentUser } from '../../lib/authUtils';
import cloudinary from '../../lib/cloudinary';
import slugify from 'slugify';

// GET all categories
export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    }, { status: 500 });
  }
}

// POST - Create new category
export async function POST(request) {
  try {
    console.log('📝 Starting category creation...');
    
    // 1. Get token from cookie
    const token = request.cookies.get("auth_token")?.value;
    console.log('🔑 Token present:', !!token);
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }

    // 2. Verify token
    const currentUser = getCurrentUser(token);
    console.log('👤 Current user:', currentUser?.email);
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }

    // 3. Check if user is admin (role: 1)
    if (currentUser.role !== 1) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 403 });
    }

    // 4. Get form data
    const formData = await request.formData();
    const name = formData.get('name');
    const bengaliName = formData.get('bengaliName');
    const image = formData.get('image');
    
    console.log('📦 Form data:', { name, bengaliName, imageExists: !!image });

    // 5. Validate inputs
    if (!name || !bengaliName) {
      return NextResponse.json({
        success: false,
        message: 'Name and Bengali name are required'
      }, { status: 400 });
    }

    // 6. Connect to database
    console.log('🔗 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connected');

    // 7. Check if category already exists
    console.log('🔍 Checking for existing category...');
    const existingCategory = await Category.findOne({ 
      $or: [{ name: name }, { bengaliName: bengaliName }] 
    });

    if (existingCategory) {
      console.log('⚠️ Category already exists:', existingCategory.name);
      return NextResponse.json({
        success: false,
        message: 'Category with this name already exists'
      }, { status: 400 });
    }

    // 8. Handle image upload
    let imageData = { url: '', public_id: '' };
    
    if (image && image.size > 0) {
      console.log('📸 Processing image upload...');
      
      // Check file size (10MB max)
      if (image.size > 10 * 1024 * 1024) {
        return NextResponse.json({
          success: false,
          message: 'Image size must be less than 10MB'
        }, { status: 400 });
      }

      try {
        // Convert image to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64Image, {
          folder: 'categories',
          width: 800,
          crop: 'limit',
          quality: 80,
        });

        console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
        
        imageData = {
          url: result.secure_url,
          public_id: result.public_id
        };
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError);
        return NextResponse.json({
          success: false,
          message: 'Failed to upload image: ' + uploadError.message
        }, { status: 500 });
      }
    }

    // 9. Generate slug using slugify
    const slug = slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });

    console.log('📝 Generated slug:', slug);

    // 10. Create category
    console.log('💾 Creating category...');
    
    const categoryData = {
      name,
      bengaliName,
      slug,
      image: imageData
    };

    const category = new Category(categoryData);
    await category.save();
    
    console.log('✅ Category created successfully!');

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error('❌ Create category error:', error);
    console.error('Stack:', error.stack);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update category
export async function PUT(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }

    const currentUser = getCurrentUser(token);
    
    if (!currentUser || currentUser.role !== 1) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 403 });
    }

    const formData = await request.formData();
    const categoryId = formData.get('categoryId');
    const name = formData.get('name');
    const bengaliName = formData.get('bengaliName');
    const image = formData.get('image');
    const removeImage = formData.get('removeImage') === 'true';

    if (!categoryId || !name || !bengaliName) {
      return NextResponse.json({
        success: false,
        message: 'Category ID, name, and Bengali name are required'
      }, { status: 400 });
    }

    await connectToDatabase();

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 });
    }

    // Check for duplicate name (excluding current category)
    const existingCategory = await Category.findOne({
      _id: { $ne: categoryId },
      $or: [{ name: name }, { bengaliName: bengaliName }]
    });

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category with this name already exists'
      }, { status: 400 });
    }

    // Handle image update
    let imageData = category.image;
    
    // If removeImage is true, delete the existing image
    if (removeImage && category.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(category.image.public_id);
        imageData = { url: '', public_id: '' };
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    // If new image is provided
    if (image && image.size > 0) {
      if (image.size > 10 * 1024 * 1024) {
        return NextResponse.json({
          success: false,
          message: 'Image size must be less than 10MB'
        }, { status: 400 });
      }

      // Delete old image if exists
      if (category.image?.public_id) {
        try {
          await cloudinary.uploader.destroy(category.image.public_id);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(base64Image, {
          folder: 'categories',
          width: 800,
          crop: 'limit',
          quality: 80,
        });

        imageData = {
          url: result.secure_url,
          public_id: result.public_id
        };
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return NextResponse.json({
          success: false,
          message: 'Failed to upload image'
        }, { status: 500 });
      }
    }

    // Generate slug from name using slugify
    const slug = slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        name,
        bengaliName,
        slug,
        image: imageData
      },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update category'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete category
export async function DELETE(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }

    const currentUser = getCurrentUser(token);
    
    if (!currentUser || currentUser.role !== 1) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json({
        success: false,
        message: 'Category ID is required'
      }, { status: 400 });
    }

    await connectToDatabase();

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 });
    }

    // Delete image from Cloudinary
    if (category.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(category.image.public_id);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    await Category.findByIdAndDelete(categoryId);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    }, { status: 500 });
  }
}