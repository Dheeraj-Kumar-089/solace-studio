import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { config } from "./config/config.js";
import authRouter from "./routes/auth.routes.js"
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js"
import reviewRouter from "./routes/review.routes.js"
import orderRouter from "./routes/order.routes.js"
import wishlistRouter from "./routes/wishlist.routes.js"


const app = express();


app.set("trust proxy", 1);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: config.FRONTEND_URL,
    methods: [ "GET", "POST", "PUT", "DELETE" ],
    credentials: true
}))


app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: `${config.BACKEND_URL}/api/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}))

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        status: "ok",
    });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/orders", orderRouter);
app.use("/api/wishlist", wishlistRouter);
export default app;
