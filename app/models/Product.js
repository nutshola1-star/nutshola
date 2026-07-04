// app/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    pricing: [
      {
        weight: { type: Number, required: true },
        unit: { type: String, required: true },
        price: { type: Number, required: true },
        discountedPrice: { type: Number, default: null },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    SKU: {
      type: String,
      unique: true,
    },
    photos: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ SKU: 1 });
productSchema.index({ isActive: 1 });

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;