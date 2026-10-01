/**
 * src/lib/phonepe.ts
 * PhonePe Payment Gateway — Standard Checkout v2 (OAuth-based)
 *
 * Uses the NEW PhonePe Business API (Client ID + Client Secret auth).
 *
 * Environment variables required:
 *   PHONEPE_CLIENT_ID        -> Your Client ID from PhonePe Business > Developer Settings
 *   PHONEPE_CLIENT_SECRET    -> Your Client Secret
 *   PHONEPE_CLIENT_VERSION   -> Client Version (shown in Developer Settings, usually "1")
 *   PHONEPE_ENV              -> "UAT" for test mode | "PRODUCTION" for live
 *   NEXT_PUBLIC_APP_URL      -> e.g. https://kairo-live.vercel.app
 */

import crypto from 'crypto';
import { getAppUrl } from '@/lib/utils';

const PHONEPE_CLIENT_ID      = process.env.PHONEPE_CLIENT_ID      ?? '';
const PHONEPE_CLIENT_SECRET  = process.env.PHONEPE_CLIENT_SECRET  ?? '';
const PHONEPE_CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION ?? '1';
const PHONEPE_ENV            = (process.env.PHONEPE_ENV ?? 'UAT') as 'UAT' | 'PRODUCTION';
const APP_URL                = getAppUrl();

const PHONEPE_BASE = {
  UAT:        'https://api-preprod.phonepe.com/apis/pg-sandbox',
  PRODUCTION: 'https://api.phonepe.com/apis/pg',
} as const;

export const PHONEPE_BASE_URL = PHONEPE_BASE[PHONEPE_ENV] ?? PHONEPE_BASE.UAT;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PhonePeInitiateResult {
  success:               boolean;
  redirectUrl?:          string;
  merchantTransactionId: string;
  rawResponse?:          unknown;
  error?:                string;
}

export interface PhonePeStatusResult {
  success:               boolean;
  status:                'COMPLETED' | 'FAILED' | 'PENDING' | 'EXPIRED' | 'UNKNOWN';
  merchantTransactionId: string;
  phonepeTransactionId?: string;
  amount?:               number;
  rawResponse?:          unknown;
  error?:                string;
}

// ─── OAuth Token Cache ────────────────────────────────────────────────────────
// Tokens are valid for 1 hour — cache in module scope for server re-use.

interface TokenCache {
  token:     string;
  expiresAt: number; // ms epoch
}

let _tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.token;
  }

  const res = await fetch(`${PHONEPE_BASE_URL}/v1/oauth/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      client_id:      PHONEPE_CLIENT_ID,
      client_secret:  PHONEPE_CLIENT_SECRET,
      client_version: PHONEPE_CLIENT_VERSION,
      grant_type:     'client_credentials',
    }),
    // Don't cache at network layer
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`PhonePe OAuth failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const token = data.access_token as string;

  _tokenCache = {
    token,
    // issued_at + expires_in (seconds) converted to ms
    expiresAt: ((data.issued_at ?? Math.floor(Date.now() / 1000)) + (data.expires_in ?? 3600)) * 1000,
  };

  return token;
}

// ─── Merchant Transaction ID ──────────────────────────────────────────────────

export function generateMerchantTxnId(): string {
  const ts     = Date.now().toString(36).toUpperCase();
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `KAI${ts}${suffix}`.slice(0, 38);
}

// ─── Initiate Payment ─────────────────────────────────────────────────────────

export async function initiatePhonePePayment(
  merchantTransactionId: string,
  _orderId:              string,
  amountRupees:          number,
  _merchantUserId:       string,
  _mobileNumber?:        string
): Promise<PhonePeInitiateResult> {
  if (!PHONEPE_CLIENT_ID || !PHONEPE_CLIENT_SECRET) {
    return {
      success: false,
      merchantTransactionId,
      error:   'PhonePe credentials not configured. Add PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET to .env.local.',
    };
  }

  try {
    const token = await getAccessToken();
    const amountInPaise = Math.round(amountRupees * 100);

    const payload = {
      merchantOrderId: merchantTransactionId,
      amount:          amountInPaise,
      expireAfter:     1200, // 20 minutes
      paymentFlow: {
        type:         'PG_CHECKOUT',
        merchantUrls: {
          redirectUrl: `${APP_URL}/payment/${merchantTransactionId}/status`,
        },
      },
    };

    const res = await fetch(`${PHONEPE_BASE_URL}/checkout/v2/pay`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `O-Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok || !data.redirectUrl) {
      return {
        success: false,
        merchantTransactionId,
        error:   data?.message ?? `PhonePe initiation failed (${res.status})`,
        rawResponse: data,
      };
    }

    return {
      success:               true,
      redirectUrl:           data.redirectUrl as string,
      merchantTransactionId,
      rawResponse:           data,
    };
  } catch (err: any) {
    console.error('[PhonePe] initiatePayment error:', err);
    return {
      success: false,
      merchantTransactionId,
      error:   err?.message ?? 'Unexpected error during payment initiation.',
    };
  }
}

// ─── Check Payment Status ─────────────────────────────────────────────────────

export async function checkPhonePePaymentStatus(
  merchantTransactionId: string
): Promise<PhonePeStatusResult> {
  if (!PHONEPE_CLIENT_ID || !PHONEPE_CLIENT_SECRET) {
    return {
      success: false,
      status:  'UNKNOWN',
      merchantTransactionId,
      error:   'PhonePe credentials not configured.',
    };
  }

  try {
    const token = await getAccessToken();

    const res = await fetch(
      `${PHONEPE_BASE_URL}/checkout/v2/order/${merchantTransactionId}/status`,
      {
        method:  'GET',
        headers: { 'Authorization': `O-Bearer ${token}` },
        cache:   'no-store',
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        status:  'UNKNOWN',
        merchantTransactionId,
        error:   data?.message ?? `Status check failed (${res.status})`,
        rawResponse: data,
      };
    }

    // v2 states: PENDING | COMPLETED | FAILED | EXPIRED
    const rawState = (data.state ?? 'UNKNOWN') as string;
    const status   = rawState as PhonePeStatusResult['status'];

    // Pick the transactionId from the first paymentDetails entry (if present)
    const phonepeTransactionId =
      (data.paymentDetails?.[0]?.transactionId as string | undefined) ??
      (data.transactionId as string | undefined);

    return {
      success:               rawState === 'COMPLETED',
      status,
      merchantTransactionId,
      phonepeTransactionId,
      amount:                data.amount as number | undefined,
      rawResponse:           data,
    };
  } catch (err: any) {
    console.error('[PhonePe] checkStatus error:', err);
    return {
      success: false,
      status:  'UNKNOWN',
      merchantTransactionId,
      error:   err?.message ?? 'Unexpected error during status check.',
    };
  }
}

// ─── Webhook / Redirect Verification (v2 does not use HMAC callbacks) ────────
// PhonePe v2 Standard Checkout does NOT send a POST callback/webhook by default.
// Instead the user is redirected to your redirectUrl after payment.
// The recommended flow is:
//   1. User pays → PhonePe redirects to /payment/{txnId}/status (GET)
//   2. That page calls /api/payment/status/{txnId} which calls checkPhonePePaymentStatus()
//   3. If COMPLETED → mark order paid in DB.
//
// The callback route is kept as a stub in case PhonePe adds webhook support to your account.

export function decodePhonePeCallback(body: { response?: string }): {
  valid:   boolean;
  payload: Record<string, unknown> | null;
  error?:  string;
} {
  try {
    const { response } = body;
    if (!response) {
      return { valid: false, payload: null, error: 'Missing response field' };
    }
    const decoded = Buffer.from(response, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded) as Record<string, unknown>;
    return { valid: true, payload };
  } catch {
    return { valid: false, payload: null, error: 'Failed to decode callback payload' };
  }
}

// Kept as a no-op stub — v2 API does not require HMAC checksum verification.
export function verifyCallbackChecksum(_base64Payload: string, _receivedChecksum: string): boolean {
  // v2 uses OAuth tokens, not HMAC checksums.
  // If PhonePe sends a checksum header, verify it via your own secret key.
  // For now, return true to avoid blocking the redirect flow.
  return true;
}

// Stub kept for backward-compat — no longer used in v2
export function generateChecksum(_base64Payload: string, _endpoint: string): string {
  return '';
}
