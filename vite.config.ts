import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
      'process.env.NEWSDATA_API_KEY': JSON.stringify(env.NEWSDATA_API_KEY || process.env.NEWSDATA_API_KEY || 'pub_6b2014d565ad49a58bee720bb2521d8d'),
      'process.env.EMAILJS_SERVICE_ID': JSON.stringify(env.EMAILJS_SERVICE_ID || process.env.EMAILJS_SERVICE_ID || 'service_h57y5e2'),
      'process.env.EMAILJS_TEMPLATE_ID': JSON.stringify(env.EMAILJS_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID || 'template_n0luv6t'),
      'process.env.EMAILJS_PUBLIC_KEY': JSON.stringify(env.EMAILJS_PUBLIC_KEY || process.env.EMAILJS_PUBLIC_KEY || 'JGJikbU3_35F5EjaS'),
      'process.env.ADMIN_EMAIL': JSON.stringify(env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'bytedailynews@gmail.com'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
