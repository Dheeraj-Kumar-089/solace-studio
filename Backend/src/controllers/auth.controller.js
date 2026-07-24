import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

// Frontend (Vercel) and backend (Render) live on different domains in
// production, so the auth cookie must be sameSite:"none" + secure:true to be
// sent cross-site at all. In development they're same-site over plain http,
// so "lax" + non-secure is what actually works there.
const authCookieOptions = {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days, matches the JWT's expiry
};

async function sendTokenResponse(user, res, message) {
    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("token", token, authCookieOptions);

    res.status(200).json({
        message,
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    });

}

export const register = async (req, res) => {
    const { email, contact, password, fullname, isSeller } = req.body;

    try {
        const existingUser = await userModel.findOne({
            $or: [{ email }, { contact }]
        });

        if (existingUser) {
            return res.status(400).json({ message: "User with this email or contact already exists" });
        }

        const user = await userModel.create({
            email,
            contact,
            password,
            fullname,
            role: isSeller ? "seller" : "buyer"
        });

        await sendTokenResponse(user, res, "User registered successfully");
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
 
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        await sendTokenResponse(user, res, "User logged in successfully");
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const googleCallback = async (req, res) => {
    const { id, displayName, emails, photos } = req.user
    const email = emails[ 0 ].value;
    const profilePic = photos[ 0 ].value;

    let user = await userModel.findOne({
        email
    })

    if (!user) {
        user = await userModel.create({
            email,
            googleId: id,
            fullname: displayName,
        })
    } else if (!user.googleId) {
        user.googleId = id;
        await user.save();
    }


    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("token", token, authCookieOptions)

    res.redirect(`${config.FRONTEND_URL}/`)
}

export const getMe = async (req, res) => {
    const user = req.user;

    res.status(200).json({
        message: "User fetched successfully",
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    })
}

export const logout = async (req, res) => {
    res.clearCookie("token", authCookieOptions);
    return res.status(200).json({
        message: "Logged out successfully",
        success: true
    });
}