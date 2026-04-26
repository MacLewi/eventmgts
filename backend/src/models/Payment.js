import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    amount: { type: Number, required: true, min: 0 },
    phoneNumber: { type: String }, // Mpesa phone number if you collect it
    transactionId: { type: String, unique: true }, // Mpesa transaction ID
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
