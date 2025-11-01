const crypto = require("crypto");

function generateSign(params, secretKey) {
  const filtered = Object.keys(params)
    .filter(k => k !== "key" && params[k] !== null && params[k] !== "")
    .sort();

  const stringA = filtered.map(k => `${k}=${params[k]}`).join("&");
  const signStr = `${stringA}&key=${secretKey}`;

  return crypto.createHash("sha256").update(signStr, "utf8").digest("hex").toLowerCase();
}

const secretKey = "rspay_token_1755057556340"; // replace with actual platform key

const payload = {
  merchantId: "INR222814",
  merchantOrderId: "2938749283473",
  amount: "100.00",
  type: 1,
  paymentCurrency: "INR",
  notifyUrl: "http://btcindia.bond/api/payment/PENDING_WITHDRAWAL",
  ext: "payment",
  accountName: "Gaurav kumar Rajak",
  accountNumber: "7607000100036657",
  ifscCode: "PUNB0760700",
  bankName: "Punjab National"
};

payload.sign = generateSign(payload, secretKey);
console.log("Payload:", JSON.stringify(payload, null, 2));
