const crypto = require("crypto");
const { getAllowedOrigins, requireEnv } = require("../config/env");

function validateReturnUrl(returnUrl) {
  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.length === 0) {
    const error = new Error("ALLOWED_ORIGINS must be configured before using VNPay return URLs");
    error.statusCode = 500;
    throw error;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(returnUrl);
  } catch {
    const error = new Error("Invalid VNPay return URL");
    error.statusCode = 400;
    throw error;
  }

  if (!allowedOrigins.includes(parsedUrl.origin)) {
    const error = new Error("VNPay return URL origin is not allowed");
    error.statusCode = 400;
    throw error;
  }

  return parsedUrl.toString();
}

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

function createPaymentUrl({ orderId, amount, ipAddr, orderInfo, returnUrl }) {
  const tmnCode = requireEnv("VNP_TMNCODE");
  const secretKey = requireEnv("VNP_HASHSECRET");
  const vnpUrl = requireEnv("VNP_URL");
  const safeReturnUrl = validateReturnUrl(returnUrl);

  const date = new Date();
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  const createDate = `${yyyy}${MM}${dd}${HH}${mm}${ss}`;

  let vnpParams = {};
  vnpParams["vnp_Version"] = "2.1.0";
  vnpParams["vnp_Command"] = "pay";
  vnpParams["vnp_TmnCode"] = tmnCode;
  vnpParams["vnp_Locale"] = "vn";
  vnpParams["vnp_CurrCode"] = "VND";
  vnpParams["vnp_TxnRef"] = orderId;
  vnpParams["vnp_OrderInfo"] = orderInfo || `Thanh toan don hang ${orderId}`;
  vnpParams["vnp_OrderType"] = "other";
  vnpParams["vnp_Amount"] = amount * 100;
  vnpParams["vnp_ReturnUrl"] = safeReturnUrl;
  vnpParams["vnp_IpAddr"] = ipAddr || "127.0.0.1";
  vnpParams["vnp_CreateDate"] = createDate;

  vnpParams = sortObject(vnpParams);

  const signData = Object.keys(vnpParams)
    .map((key) => `${key}=${vnpParams[key]}`)
    .join("&");

  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnpParams["vnp_SecureHash"] = signed;

  const finalUrlParams = Object.keys(vnpParams)
    .map((key) => `${key}=${vnpParams[key]}`)
    .join("&");
  return `${vnpUrl}?${finalUrlParams}`;
}

function verifyReturnUrl(queryParams) {
  const secretKey = requireEnv("VNP_HASHSECRET");
  let vnpParams = { ...queryParams };
  const secureHash = vnpParams["vnp_SecureHash"];

  delete vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHashType"];

  vnpParams = sortObject(vnpParams);

  const signData = Object.keys(vnpParams)
    .map((key) => {
      return `${key}=${vnpParams[key]}`;
    })
    .join("&");

  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return signed === secureHash;
}

module.exports = { createPaymentUrl, verifyReturnUrl, validateReturnUrl };
