
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
