/**
 * src/lib/phonepe.ts
 * PhonePe Payment Gateway helper
 *
 * Environment variables required (see .env.example):
 *   PHONEPE_MERCHANT_ID
 *   PHONEPE_SALT_KEY
 *   PHONEPE_SALT_INDEX
 *   PHONEPE_ENV            -> "UAT" | "PRODUCTION"
 *   NEXT_PUBLIC_APP_URL    -> e.g. https://kairo.kccitm.org
 */

import crypto from 'crypto';
import { getAppUrl } from '@/lib/utils';

const PHONEPE_MERCHANT_ID  = process.env.PHONEPE_MERCHANT_ID  ?? '';
const PHONEPE_SALT_KEY     = process.env.PHONEPE_SALT_KEY     ?? '';
const PHONEPE_SALT_INDEX   = process.env.PHONEPE_SALT_INDEX   ?? '1';
const PHONEPE_ENV          = process.env.PHONEPE_ENV          ?? 'UAT';
const APP_URL              = getAppUrl();

const PHONEPE_URLS = {
  UAT:        'https://api-preprod.phonepe.com/apis/pg-sandbox',
  PRODUCTION: 'https://api.phonepe.com/apis/hermes',
} as const;

export const PHONEPE_BASE_URL = PHONEPE_URLS[PHONEPE_ENV as keyof typeof PHONEPE_URLS] ?? PHONEPE_URLS.UAT;

export interface PhonePeInitiatePayload {
  merchantId:            string;
  merchantTransactionId: string;
  merchantUserId:        string;
  amount:                number;
  redirectUrl:           string;
  redirectMode:          'POST' | 'GET';
  callbackUrl:           string;
  mobileNumber?:         string;
  paymentInstrument:     { type: 'PAY_PAGE' };
}

export interface PhonePeInitiateResult {
  success: boolean;
  redirectUrl?: string;
  merchantTransactionId: string;
  rawResponse?: unknown;
  error?: string;
}

export interface PhonePeStatusResult {
  success:               boolean;
  status:                'SUCCESS' | 'FAILURE' | 'PENDING' | 'UNKNOWN';
  merchantTransactionId: string;
  phonepeTransactionId?: string;
  amount?:               number;
  rawResponse?:          unknown;
  error?:                string;
}

export function generateChecksum(base64Payload: string, endpoint: string): string {
  const hashInput = base64Payload + endpoint + PHONEPE_SALT_KEY;
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
  return `${hash}###${PHONEPE_SALT_INDEX}`;
}

export function verifyCallbackChecksum(base64Payload: string, receivedChecksum: string): boolean {
  if (!PHONEPE_SALT_KEY) return false;
  const endpoint = '/pg/v1/pay';
  const expectedChecksum = generateChecksum(base64Payload, endpoint);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedChecksum, 'utf8'),
      Buffer.from(receivedChecksum, 'utf8')
    );
  } catch {
    return false;
  }
}

export function generateMerchantTxnId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix    = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `KAI${timestamp}${suffix}`.slice(0, 38);
}

export async function initiatePhonePePayment(
  merchantTransactionId: string,
  _orderId: string,
  amountRupees: number,
  merchantUserId: string,
  mobileNumber?: string
): Promise<PhonePeInitiateResult> {
  if (!PHONEPE_MERCHANT_ID || !PHONEPE_SALT_KEY) {
    return {
      success: false,
      merchantTransactionId,
      error: 'PhonePe credentials not configured. Add PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY to .env.local.',
    };
  }

  const amountInPaise = Math.round(amountRupees * 100);

  const payload: PhonePeInitiatePayload = {
    merchantId:            PHONEPE_MERCHANT_ID,
    merchantTransactionId,
    merchantUserId,
    amount:                amountInPaise,
    redirectUrl:           `${APP_URL}/payment/${merchantTransactionId}/status`,
    redirectMode:          'GET',
    callbackUrl:           `${APP_URL}/api/payment/callback`,
    mobileNumber,
    paymentInstrument:     { type: 'PAY_PAGE' },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const endpoint      = '/pg/v1/pay';
  const checksum      = generateChecksum(base64Payload, endpoint);

  // TODO: Uncomment the API call below after adding your PhonePe credentials to .env.local
  //
  // const response = await fetch(`${PHONEPE_BASE_URL}${endpoint}`, {
  //   method:  'POST',
  //   headers: {
  //     'Content-Type':  'application/json',
  //     'X-VERIFY':      checksum,
  //     'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
  //   },
  //   body: JSON.stringify({ request: base64Payload }),
  // });
  // const data = await response.json();
  //
  // if (data?.success && data?.data?.instrumentResponse?.redirectInfo?.url) {
  //   return {
  //     success:               true,
  //     redirectUrl:           data.data.instrumentResponse.redirectInfo.url,
  //     merchantTransactionId,
  //     rawResponse:           data,
  //   };
  // }
  // return {
  //   success:               false,
  //   merchantTransactionId,
  //   error:                 data?.message ?? 'PhonePe initiation failed',
  //   rawResponse:           data,
  // };

  // REMOVE THIS return statement once you uncomment the API call above:
  void checksum;
  return {
    success: false,
    merchantTransactionId,
    error: 'PHONEPE_API_NOT_CONFIGURED - see src/lib/phonepe.ts TODO comment',
  };
}

export async function checkPhonePePaymentStatus(
  merchantTransactionId: string
): Promise<PhonePeStatusResult> {
  if (!PHONEPE_MERCHANT_ID || !PHONEPE_SALT_KEY) {
    return {
      success: false,
      status:  'UNKNOWN',
      merchantTransactionId,
      error:   'PhonePe credentials not configured.',
    };
  }

  const endpoint  = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`;
  const hashInput = endpoint + PHONEPE_SALT_KEY;
  const hash      = crypto.createHash('sha256').update(hashInput).digest('hex');
  const checksum  = `${hash}###${PHONEPE_SALT_INDEX}`;

  // TODO: Uncomment the API call below after adding your PhonePe credentials to .env.local
  //
  // const response = await fetch(`${PHONEPE_BASE_URL}${endpoint}`, {
  //   method:  'GET',
  //   headers: {
  //     'Content-Type':  'application/json',
  //     'X-VERIFY':      checksum,
  //     'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
  //   },
  // });
  // const data = await response.json();
  //
  // const txnStatus = data?.data?.state ?? 'UNKNOWN';
  // return {
  //   success:               data?.success ?? false,
  //   status:                txnStatus as PhonePeStatusResult['status'],
  //   merchantTransactionId,
  //   phonepeTransactionId:  data?.data?.transactionId,
  //   amount:                data?.data?.amount,
  //   rawResponse:           data,
  // };

  // REMOVE THIS return statement once you uncomment the API call above:
  void checksum;
  return {
    success: false,
    status:  'UNKNOWN',
    merchantTransactionId,
    error:   'PHONEPE_API_NOT_CONFIGURED - see src/lib/phonepe.ts TODO comment',
  };
}

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
