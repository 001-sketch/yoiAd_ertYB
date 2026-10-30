import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const stripeSecretKey = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

  const stripeDevPlugin = {
    name: 'stripe-dev-api',
    configureServer(server: any) {
      server.middlewares.use('/api/create-checkout', async (req: any, res: any) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        if (!stripeSecretKey) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'STRIPE_SECRET_KEY is missing in your local .env file.' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { amount, message } = JSON.parse(body || '{}');
            const parsedAmount = Number(amount);
            if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid donation amount.' }));
              return;
            }
            const coffeeAmount = Math.min(Math.max(Math.round(parsedAmount), 1), 100);
            const sanitizedMessage = typeof message === 'string'
              ? message.trim().slice(0, 200)
              : undefined;

            const { default: Stripe } = await import('stripe');
            const stripe = new Stripe(stripeSecretKey);

            const session = await stripe.checkout.sessions.create({
              line_items: [
                {
                  price_data: {
                    currency: 'usd',
                    product_data: {
                      name: `☕ Buy ByteDaily ${coffeeAmount === 1 ? 'a Coffee' : `${coffeeAmount} Coffees`}`,
                      description: sanitizedMessage || 'Thanks for supporting ByteDaily News!',
                      tax_code: 'txcd_10000000', // General - Electronically Supplied Services (eligible for Managed Payments)
                    },
                    unit_amount: coffeeAmount * 100,
                  },
                  quantity: 1,
                },
              ],
              mode: 'payment',
              success_url: `http://localhost:3000/?payment=success`,
              cancel_url: `http://localhost:3000/?payment=cancelled`,
              submit_type: 'donate',
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ url: session.url }));
          } catch (err: any) {
            console.error('Local Stripe dev error:', err?.message || err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Failed to create checkout session' }));
          }
        });
      });
    },
  };

  return {
    plugins: [react(), tailwindcss(), stripeDevPlugin],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
      'process.env.NEWSDATA_API_KEY': JSON.stringify(env.NEWSDATA_API_KEY || process.env.NEWSDATA_API_KEY || 'pub_6b2014d565ad49a58bee720bb2521d8d'),
      'process.env.EMAILJS_SERVICE_ID': JSON.stringify(env.EMAILJS_SERVICE_ID || process.env.EMAILJS_SERVICE_ID || 'service_3kvfetr'),
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
