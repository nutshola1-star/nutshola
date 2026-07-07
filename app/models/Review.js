// app/models/Review.js
import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    reviewerName: {
      type: String,
      required: [true, "Reviewer name is required"],
      trim: true,
    },
    reviewerDistrict: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters"],
      maxlength: [500, "Review cannot exceed 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ReviewSchema.index({ isActive: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ createdAt: -1 });

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;