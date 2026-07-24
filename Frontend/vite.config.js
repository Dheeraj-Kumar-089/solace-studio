import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      }
    }
  }
});



//vite ke development server par koi bhi route agar /api se start hoga toh automatically http://localhost:3000 pe chala jayega
// changeOrigin:true iske help se hum backend ki cookies ko frontend me receive kr payenge
// secure:false is used to allow the request to be sent to the backend even if it is not secure (HTTP)
// port forwarding is used to forward the request from one port to another port (backend)

// backend phir apna response frontend me vite ko dega and then vite use frontend ko dega 


// ye sirf development me use hoga production me nhi. vite ka server sirf development me run hota h 
