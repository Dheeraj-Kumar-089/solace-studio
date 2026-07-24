import { Router } from "express";
import { validateLoginUser, validateRegisterUser } from "../validators/auth.validator.js";
import { googleCallback,getMe, login, register, logout } from "../controllers/auth.controller.js";
import passport from "passport";
import { config } from "../config/config.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router()

router.post('/register', validateRegisterUser, register);

router.post('/login', validateLoginUser, login);


// /api/auth/google
router.get("/google",
    passport.authenticate("google", { scope: [ "profile", "email" ] }))


    
router.get("/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${config.FRONTEND_URL}/login`
    }),
    googleCallback,
)


/**
 * @route GET /api/auth/me
 * @description Get the authenticated user's profile
 * @access Private
 */
router.get('/me',authenticateUser, getMe)

/**
 * @route POST /api/auth/logout
 * @description Clear the session cookie
 * @access Private
 */
router.post('/logout', authenticateUser, logout)



export default router
