import dotenv from "dotenv"
dotenv.config()


if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables")
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables")
}

if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
    throw new Error("GOOGLE_OAUTH_CLIENT_ID is not defined in environment variables")
}

if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    throw new Error("GOOGLE_OAUTH_CLIENT_SECRET is not defined in environment variables")
}

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in environment variables")
}

if (!process.env.RAZORPAY_KEY_ID) {
    throw new Error("RAZORPAY_KEY_ID is not defined in environment variables")
}

if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_SECRET is not defined in environment variables")
}

if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not defined — Kairis AI search will fall back to rule-based parsing.")
}

const NODE_ENV = process.env.NODE_ENV || "development"
const isProduction = NODE_ENV === "production"

const FRONTEND_URL = isProduction
    ? process.env.PROD_FRONTEND_URL
    : (process.env.DEV_FRONTEND_URL || "http://localhost:5173")

const BACKEND_URL = isProduction
    ? process.env.PROD_BACKEND_URL
    : (process.env.DEV_BACKEND_URL || "http://localhost:3000")

if (isProduction && !FRONTEND_URL) {
    console.warn("PROD_FRONTEND_URL is not defined — CORS and Google OAuth redirects will fail until it's set.")
}
if (isProduction && !BACKEND_URL) {
    console.warn("PROD_BACKEND_URL is not defined — the Google OAuth callback URL will be wrong until it's set.")
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    NODE_ENV,
    isProduction,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    FRONTEND_URL,
    BACKEND_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
}

