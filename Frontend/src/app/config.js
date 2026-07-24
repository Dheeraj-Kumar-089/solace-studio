// Resolves which backend the app talks to, based on Vite's build mode —
// exactly the same dev/prod-switch idea used on the backend (see
// Backend/src/config/config.js). `npm run dev` => mode "development",
// `npm run build` / the Vercel production build => mode "production".
//
// In development this is left blank on purpose: axios instances then use
// relative "/api/..." paths, which vite.config.js's dev-server proxy forwards
// to the local Express server, keeping requests same-origin so auth cookies
// work without any cross-site cookie settings.
//
// In production there is no dev-server proxy, so this MUST be set to the
// deployed Render backend's URL (VITE_PROD_API_URL in Frontend/.env, or as an
// environment variable in the Vercel project settings) once it exists.
const isProduction = import.meta.env.MODE === "production";

const configuredUrl = isProduction
    ? import.meta.env.VITE_PROD_API_URL
    : import.meta.env.VITE_DEV_API_URL;

if (isProduction && !configuredUrl) {
    console.warn(
        "VITE_PROD_API_URL is not set — API requests will be sent as relative paths, " +
        "which only works if the frontend and backend are served from the same domain."
    );
}

export const API_BASE_URL = configuredUrl || "";
