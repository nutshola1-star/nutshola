// app/models/Slide.js
import mongoose from "mongoose";

const SlideImageSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Image URL is required"],
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)/.test(v);
        },
        message: "Image must be a valid URL",
      },
    },
    link: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return v === "" || /^(https?:\/\/)/.test(v);
        },
        message: "Link must be a valid URL or empty",
      },
    },
    type: {
      type: String,
      enum: ['main', 'fixed-right-1', 'fixed-right-2'],
      default: 'main',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Add indexes for better query performance
SlideImageSchema.index({ createdAt: -1 });
SlideImageSchema.index({ isActive: 1 });
SlideImageSchema.index({ type: 1 });

// Use a consistent name for the model
const SlideImage =
  mongoose.models.SlideImage || mongoose.model("SlideImage", SlideImageSchema);

export default SlideImage;