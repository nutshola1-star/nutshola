// app/models/CourierCharge.js
import mongoose from "mongoose";

const CourierChargeSchema = new mongoose.Schema(
  {
    weightFrom: {
      type: Number,
      required: [true, "Starting weight is required"],
      min: [0, "Weight cannot be negative"],
    },
    weightTo: {
      type: Number,
      required: [true, "Ending weight is required"],
      min: [0, "Weight cannot be negative"],
      validate: {
        validator: function (value) {
          return value > this.weightFrom;
        },
        message: "Ending weight must be greater than starting weight",
      },
    },
    insideDhaka: {
      type: Number,
      required: [true, "Inside Dhaka charge is required"],
      min: [0, "Charge cannot be negative"],
    },
    outsideDhaka: {
      type: Number,
      required: [true, "Outside Dhaka charge is required"],
      min: [0, "Charge cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Add index for better query performance
CourierChargeSchema.index({ weightFrom: 1, weightTo: 1 });

// Use a consistent name for the model
const CourierCharge =
  mongoose.models.CourierCharge ||
  mongoose.model("CourierCharge", CourierChargeSchema);

export default CourierCharge;