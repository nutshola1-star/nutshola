// app/models/Coupon.js
import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Coupon type is required"],
      enum: ["fixed", "percentage", "free_shipping"],
    },
    // For fixed amount discount
    amount: {
      type: Number,
      min: 0,
      default: null,
    },
    // For percentage discount
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    // Maximum discount for percentage type (capped amount)
    maxDiscount: {
      type: Number,
      min: 0,
      default: null,
    },
    // Minimum purchase amount required
    minPurchase: {
      type: Number,
      required: [true, "Minimum purchase amount is required"],
      min: 0,
      default: 0,
    },
    // Usage limits
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
      min: 1,
    },
    // How many times this coupon has been used
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Per user usage limit
    perUserLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Start date
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      default: Date.now,
    },
    // Expiry date
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Users who have used this coupon
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
      },
    ],
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1 });
CouponSchema.index({ expiryDate: 1 });
CouponSchema.index({ startDate: 1 });
CouponSchema.index({ type: 1 });

// Check if coupon is valid
CouponSchema.methods.isValid = function() {
  const now = new Date();
  
  if (!this.isActive) return false;
  if (this.expiryDate && this.expiryDate < now) return false;
  if (this.startDate && this.startDate > now) return false;
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return false;
  
  return true;
};

// Check if coupon is applicable for a purchase amount
CouponSchema.methods.isApplicable = function(amount) {
  if (!this.isValid()) return false;
  if (this.minPurchase && amount < this.minPurchase) return false;
  return true;
};

// Calculate discount
CouponSchema.methods.calculateDiscount = function(amount) {
  if (!this.isApplicable(amount)) return 0;
  
  let discount = 0;
  
  switch (this.type) {
    case "fixed":
      discount = this.amount || 0;
      break;
    case "percentage":
      discount = (amount * (this.percentage || 0)) / 100;
      if (this.maxDiscount) {
        discount = Math.min(discount, this.maxDiscount);
      }
      break;
    case "free_shipping":
      // Free shipping will be handled separately
      discount = 0;
      break;
    default:
      discount = 0;
  }
  
  return Math.min(discount, amount); // Can't discount more than the amount
};

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);

export default Coupon;