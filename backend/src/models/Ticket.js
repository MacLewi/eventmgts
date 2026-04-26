import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "At least one ticket required"],
      default: 1,
    },

    // ✅ Price per ticket (KES)
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },

    // ✅ Total amount (KES)
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },

    // ✅ M-Pesa transaction reference
    transactionId: {
      type: String,
      default: null,
    },

    // ✅ Payment status
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // ✅ Optional: phone used for payment
    phoneNumber: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);