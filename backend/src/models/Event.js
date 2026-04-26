import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    description: { type: String, required: true },

    category: { type: String, required: true },

    date: { type: Date, required: true },

    location: { type: String, required: true },

    capacity: { type: Number, default: 0, min: 0 },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    posterUrl: { type: String },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    tags: [{ type: String }],

    averageRating: { type: Number, default: 0 },

    // ✅ Price field in Kenyan Shillings
    price: {
      type: Number,
      required: [true, 'Ticket price (KES) is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: Number.isFinite,
        message: 'Price must be a valid number',
      },
      set: (v) => Math.round(v), // ensures clean integer (KES doesn’t need decimals)
    },
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);
export default Event;
