import axios from "axios";

// 🔥 TEMP in-memory store (replace with DB later)
let payments = [];

/**
 * ✅ 1. INITIATE STK PUSH
 */
export const initiateSTKPush = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { amount, phone } = req.body;
    const userId = req.user?.id;

    if (!phone || !amount) {
      return res.status(400).json({ message: "Phone and amount are required" });
    }

    // Format phone (07 -> 2547)
    let formattedPhone = phone;
    if (phone.startsWith("07")) {
      formattedPhone = "254" + phone.substring(1);
    }

    // 🔥 Simulate STK push (replace with Daraja API)
    const transactionId = "TX-" + Date.now();

    // Save as pending
    payments.push({
      transactionId,
      eventId,
      userId,
      phone: formattedPhone,
      amount,
      status: "pending",
      createdAt: new Date(),
    });

    console.log("📲 STK Push sent to:", formattedPhone);

    return res.json({
      message: "STK push sent",
      transactionId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
};


/**
 * ✅ 2. M-PESA CALLBACK (simulate success)
 */
export const mpesaCallback = async (req, res) => {
  try {
    // In real Daraja, you'd parse req.body
    const { transactionId } = req.body;

    const payment = payments.find(p => p.transactionId === transactionId);

    if (payment) {
      payment.status = "success";
    }

    console.log("✅ Payment confirmed:", transactionId);

    res.json({ message: "Callback received" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Callback error" });
  }
};


/**
 * ✅ 3. GET MY PAYMENTS
 */
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user?.id;

    const userPayments = payments.filter(p => p.userId === userId);

    res.json({ payments: userPayments });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};


/**
 * ✅ 4. GET EVENT PAYMENTS  ⭐ (THIS FIXES YOUR ERROR)
 */
export const getEventPayments = async (req, res) => {
  try {
    const { id: eventId } = req.params;

    const eventPayments = payments.filter(p => p.eventId === eventId);

    res.json({ payments: eventPayments });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event payments" });
  }
};