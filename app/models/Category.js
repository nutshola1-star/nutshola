// app/models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    bengaliName: {
      type: String,
      required: [true, "Bengali name is required"],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
    },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;