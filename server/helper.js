// server/helpers.js
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

export const nowISO = () => new Date().toISOString();

export function secondsBetween(isoStart, isoEnd) {
  if (!isoStart || !isoEnd) return null;
  const s = (new Date(isoEnd).getTime() - new Date(isoStart).getTime()) / 1000;
  return Math.max(0, Math.round(s));
}

export function verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  // signature verification using HMAC SHA256
  const key_secret = process.env.RAZORPAY_SECRET;
  if (!key_secret) return false;
  const shasum = crypto.createHmac('sha256', key_secret);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest('hex');
  return digest === razorpay_signature;
}
