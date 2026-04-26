import express from "express";
import axios from "axios";
const router = express.Router();



// === CONFIG ===
const consumerKey = "8uG9GlMqxCTxJZOl3KcMFSYzZdtGpACW";
const consumerSecret = "DXDM99Fju76Tm0VD";
const shortCode = "174379"; // sandbox shortcode
const passKey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
const phone = "254743403399"; // format: 2547...
const callbackUrl = "https://yourdomain.com/callback"; // must be публич

// === GET TOKEN ===
async function getAccessToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  return response.data.access_token;
}

// === STK PUSH ===
async function stkPush(amount) {
  const token = await getAccessToken();

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const password = Buffer.from(
    shortCode + passKey + timestamp
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount.toString(),
        PartyA: phone,
        PartyB: shortCode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: "Test",
        TransactionDesc: "Test Payment",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}
// POST /api/mpesa/payments/:eventId/buy
router.post("/mpesa/payments/buy", async (req, res) => {
  try {console.log(req.body.event.price);
  

    stkPush(req.body.event.price);
    // const { amount } = req.body;
    // const { eventId } = req.params;

    // if (!amount || amount <= 0) {
    //   return res.status(400).json({ message: "Amount must be greater than 0" });
    // }


    // https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials


    // 🔑 Integrate with M-Pesa STK Push here
    // Example pseudo-code:
    // const response = await mpesaClient.stkPush({
    //   phoneNumber: req.user.phone,
    //   amount,
    //   accountReference: eventId,
    //   transactionDesc: `Ticket purchase for event ${eventId}`
    // });

    res.json({
      success: true,
      message: `Payment initiated for total KES 3`,
      eventId: 1,
      amount: 2,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment initiation failed" });
  }
});

export default router;