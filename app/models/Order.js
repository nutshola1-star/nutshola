// app/models/Order.js
import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  sku: String,
  weight: String,
  weightInGrams: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: Number,
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      thana: String,
      district: {
        type: String,
        required: true,
      },
    },
    items: [OrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    coupon: {
      code: { 
        type: String,
        default: null 
      },
      type: { 
        type: String,
        default: null 
      },
      discount: { 
        type: Number,
        default: 0 
      },
    },
    deliveryCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWeight: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingId: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online", "bank"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ "customer.phone": 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ createdAt: -1 });

// Generate unique order number (5 digit alphanumeric)
OrderSchema.statics.generateOrderNumber = async function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let orderNumber;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 100;

  while (exists && attempts < maxAttempts) {
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    orderNumber = result;
    const existing = await this.findOne({ orderNumber });
    exists = !!existing;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Could not generate unique order number');
  }

  return orderNumber;
};

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;