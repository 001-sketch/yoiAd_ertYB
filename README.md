# Byte_daily — Nairobi Tech Pulse
<img width="125" height="125" alt="Neon Chip Byte Daily Logo" src="https://github.com/user-attachments/assets/3ca9b3cc-909b-4f43-87b5-5143d973cce1" />

> Real-time tech intelligence synthesized for the modern pioneer. From the streets of Nairobi to the clusters of Silicon Valley.

---

## Overview

**Byte_daily** is a real-time technology news platform focused on the African tech ecosystem and global innovation. It aggregates, curates, and delivers high-signal news from Nairobi's Silicon Savannah and international technology markets — formatted for readability and speed.

The platform is designed to keep professionals, founders, and enthusiasts informed on what matters, without the noise.

---

## Services

| Service | Description |
|---|---|
| **Live News Feed** | Real-time tech news sourced from the NewsData.io API, filtered for Kenya and global technology categories. |
| **AI Article Synthesis** | Powered by Gemini AI to expand and enrich article content when full-text is unavailable. |
| **Newsletter Subscription** | Email subscription service backed by Firebase Firestore and EmailJS for new subscriber notifications. |
| **Support via Stripe** | Integrated "Buy Me a Coffee" donation flow powered by Stripe Checkout for audience support. |

---

## Tech Stack

- **Frontend**: React 19 · TypeScript · Vite · Tailwind CSS v4
- **Data**: NewsData.io API · Google Gemini AI
- **Backend**: Vercel Serverless Functions
- **Database**: Firebase Firestore
- **Payments**: Stripe Checkout
- **Email**: EmailJS

---

## Local Development

**Prerequisites:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Fill in: GEMINI_API_KEY, NEWSDATA_API_KEY, EMAILJS_*, STRIPE_SECRET_KEY, APP_URL

# 3. Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Deployment

This project is deployed on **Vercel**. Push to the main branch to trigger an automatic deployment.

Ensure the following environment variables are configured in your Vercel project settings:

- `STRIPE_SECRET_KEY`
- `APP_URL`
- `GEMINI_API_KEY`
- `NEWSDATA_API_KEY`
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`

---

## License

© 2026 Byte_daily. All rights reserved.
