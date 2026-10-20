/**
 * Stripe Client-Side Service
 * Calls /api/create-checkout-session first, and automatically falls back to
 * the Supabase Edge Function (/functions/v1/create-checkout-session) for static drag-and-drop deploys.
 */
import { supabaseUrl, supabaseAnonKey } from '../lib/supabaseClient';

export interface CheckoutSessionOptions {
  packageType: '30_days' | '90_days' | '1_year' | '1_day' | '1_week' | '1_month';
  brandName: string;
  tagline?: string;
  logoUrl?: string;
  linkUrl: string;
  slotNumber?: number;
}

export async function createCheckoutSession(
  opts: CheckoutSessionOptions
): Promise<{ checkoutUrl: string; sessionId?: string }> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://footballmanagersim.com';

  const payload = {
    packageType: opts.packageType,
    brandName: opts.brandName.trim(),
    tagline: (opts.tagline || opts.brandName).trim(),
    logoUrl: opts.logoUrl || '',
    linkUrl: opts.linkUrl.trim(),
    slotNumber: opts.slotNumber,
    origin
  };

  // 1. Try local/Netlify /api/create-checkout-session first
  let response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // 2. If static drag-and-drop deploy returns 404/405, call Supabase Edge Function
  if (response.status === 404 || response.status === 405) {
    response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify(payload)
    });
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.error || `Failed to initialize payment session (${response.status})`);
  }

  if (!data?.checkoutUrl) {
    throw new Error('Server did not return a valid checkout URL.');
  }

  return { checkoutUrl: data.checkoutUrl, sessionId: data.sessionId };
}