import axios from "axios";

const consumerKey = "m90eGi5c1EfRB35khHCmAJAeqXmJm0c4jbLAHgpn2PLMR2ec";
const consumerSecret = "XB0BvUgjVzLuG2TyeDT35BllBH6hUGUb2CwvhGDF8bhRsyO7qkyVTbabsV526ALN";
const shortCode = "174379";
const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

async function getAccessToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` }
    }
  );

  return res.data.access_token;
}

export async function stkPush(phone, amount) {
  const token = await getAccessToken();

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

  const res = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: "https://yourdomain.com/api/mpesa/callback",
      AccountReference: "EventTicket",
      TransactionDesc: "Ticket Payment"
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  return res.data;
}