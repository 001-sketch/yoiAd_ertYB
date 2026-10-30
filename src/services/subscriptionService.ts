import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const EMAIL_REGEX = /^[^@]+@[^@]+\.[^@]+$/;
const STORAGE_KEY = 'byte_subscribed_emails';

// EmailJS & Notification target configuration
export const NOTIFICATION_RECIPIENT = process.env.ADMIN_EMAIL || 'bytedailynews@gmail.com';
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_3kvfetr';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_n0luv6t';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'JGJikbU3_35F5EjaS';

export interface SubscriptionResult {
  success: boolean;
  message: string;
  isAlreadySubscribed?: boolean;
}

/**
 * Checks if email was already marked subscribed in this client session
 */
export function isEmailSubscribedLocally(email: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const list: string[] = JSON.parse(raw);
    return list.includes(email.trim().toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Persists an email to local subscriber cache
 */
function markEmailSubscribedLocally(email: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const normalized = email.trim().toLowerCase();
    if (!list.includes(normalized)) {
      list.push(normalized);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Dispatches an EmailJS alert to bytedailynews@gmail.com
 */
async function dispatchEmailNotification(subscriberEmail: string): Promise<boolean> {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.info(`[EmailJS] Target recipient configured: ${NOTIFICATION_RECIPIENT}. Set credentials to activate live dispatch.`);
    return false;
  }

  const timestamp = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });

  // Supply standard and customized template variables to match any EmailJS template configuration
  const templateParams = {
    to_email: NOTIFICATION_RECIPIENT,
    recipient_email: NOTIFICATION_RECIPIENT,
    to_name: 'Byte_daily Admin',
    from_name: 'Byte_daily Web Gateway',
    email: subscriberEmail,
    user_email: subscriberEmail,
    subscriber_email: subscriberEmail,
    reply_to: subscriberEmail,
    app_name: 'Byte_daily',
    source: 'Nairobi Terminal Gateway',
    subscription_timestamp: timestamp,
    date: timestamp,
    message: `New subscription captured from: ${subscriberEmail} on ${timestamp}`
  };

  try {
    const masked = subscriberEmail.replace(/^(.)(.*)(@.*)$/, (_, a, _b, c) => `${a}***${c}`);
    console.log(`[EmailJS] Initiating dispatch to notification endpoint for: ${masked}`);
    const res = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    console.log(`[EmailJS] ✅ Dispatch completed. Status: ${res.status}`);
    return true;
  } catch (err: any) {
    console.error('[EmailJS] ❌ Dispatch failed:', err?.message || 'Network error');
    return false;
  }
}

/**
 * Subscribes an email to the Byte_daily Firebase Firestore network
 * and triggers EmailJS alert to bytedailynews@gmail.com
 */
export async function subscribeToNewsletter(rawEmail: string): Promise<SubscriptionResult> {
  const email = rawEmail.trim().toLowerCase();

  // Validate format & length
  if (!email || !EMAIL_REGEX.test(email) || email.length > 256) {
    return {
      success: false,
      message: 'Please provide a valid email address (e.g. name@domain.com).'
    };
  }

  // Check if locally registered already
  if (isEmailSubscribedLocally(email)) {
    return {
      success: true,
      message: 'Signal confirmed: You are already plugged into the Byte_network intelligence stream.',
      isAlreadySubscribed: true
    };
  }

  try {
    // 1. Store in Firebase Firestore
    const subsCollection = collection(db, 'subscriptions');
    await addDoc(subsCollection, {
      email,
      createdAt: serverTimestamp(),
      status: 'active'
    });

    // 2. Mark in local browser cache
    markEmailSubscribedLocally(email);

    // 3. Dispatch EmailJS notification to bytedailynews@gmail.com
    await dispatchEmailNotification(email);

    return {
      success: true,
      message: "Signal received! You're now connected to Nairobi's premier tech intelligence stream."
    };
  } catch (error) {
    console.error('Subscription error:', error);
    try {
      handleFirestoreError(error, OperationType.CREATE, 'subscriptions');
    } catch {
      // Handled for logging
    }

    return {
      success: false,
      message: 'Transmission disrupted. Please verify your connection and try again.'
    };
  }
}
