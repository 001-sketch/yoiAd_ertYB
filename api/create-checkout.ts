import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req: any, res: any) {
  // Enforce security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check Stripe secret key configuration
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[Stripe] STRIPE_SECRET_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Payment gateway configuration error.' });
  }

  try {
    const { amount, message } = req.body || {};

    // Validate and sanitize numeric amount
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
      return res.status(400).json({ error: 'Invalid donation amount.' });
    }
    const coffeeAmount = Math.min(Math.max(Math.round(parsedAmount), 1), 100);

    // Sanitize optional message (prevent unbounded payload)
    const sanitizedMessage = typeof message === 'string'
      ? message.trim().slice(0, 200)
      : undefined;

    // Secure base URL determination
    const rawAppUrl = process.env.APP_URL || 'https://yoi-ad-ert-yb.vercel.app';
    const appUrl = rawAppUrl.replace(/\/$/, '');

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
            unit_amount: coffeeAmount * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/?payment=success`,
      cancel_url: `${appUrl}/?payment=cancelled`,
      submit_type: 'donate',
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe] Checkout creation failed:', error?.message || error);
    return res.status(500).json({
      error: 'Unable to initialize secure checkout session. Please try again later.',
    });
  }
}
