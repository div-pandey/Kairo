import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { ADMIN_EMAIL, APP_NAME } from '@/lib/constants';
import { OrderStatus, ORDER_STATUS_LABELS } from '@/types';
import { formatCurrency, getAppUrl } from '@/lib/utils';

// Brevo SMTP Transporter (Delivers to any email address without custom domain verification)
const brevoTransporter =
  process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_KEY
    ? nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
        port: Number(process.env.BREVO_SMTP_PORT) || 587,
        auth: {
          user: process.env.BREVO_SMTP_USER,
          pass: process.env.BREVO_SMTP_KEY,
        },
      })
    : null;

// Resend Email Client (Fallback)
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.FROM_EMAIL || `${APP_NAME} <div.pandey.html@gmail.com>`;

/**
 * Core email sender: Uses Brevo SMTP as primary transport, falling back to Resend or mock logger.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (brevoTransporter) {
    return await brevoTransporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
    });
  }

  if (resend) {
    return await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
  }

  console.log(`[Email Service Mock] Sending to: ${to} | Subject: ${subject}`);
}

export async function sendAdminOrderNotification(params: {
  orderId: string;
  orderNumber: string;
  studentName: string;
  studentKccId: string;
  totalAmount: number;
  fileCount: number;
}) {
  const { orderId, orderNumber, studentName, studentKccId, totalAmount, fileCount } = params;

  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `[New Order] ${orderNumber} - ${studentName} (${studentKccId})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2>New Print Order Received</h2>
          <p>A new print request has been placed on <strong>${APP_NAME}</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Student:</strong> ${studentName} (ID: ${studentKccId})</p>
          <p><strong>Files:</strong> ${fileCount}</p>
          <p><strong>Total Amount:</strong> ${formatCurrency(totalAmount)}</p>
          <div style="margin-top: 25px;">
            <a href="${getAppUrl()}/admin/orders/${orderId}"
               style="background-color: #2563eb; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               Open in Admin Console
            </a>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send admin order notification email:', err);
  }
}

export async function sendStudentOrderConfirmation(params: {
  email: string;
  studentName: string;
  orderNumber: string;
  orderId: string;
  totalAmount: number;
}) {
  const { email, studentName, orderNumber, orderId, totalAmount } = params;

  if (!email) {
    console.log(`[Email Service] No recipient email provided for order confirmation: ${orderNumber}`);
    return;
  }

  try {
    await sendEmail({
      to: email,
      subject: `Order Confirmed: ${orderNumber} - Kairo KCC Printing`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2>Order Received!</h2>
          <p>Hi ${studentName},</p>
          <p>We received your print order <strong>${orderNumber}</strong> for ${formatCurrency(totalAmount)}.</p>
          <p>Our campus desk will process your printout shortly. You will be notified once it is ready for collection.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <a href="${getAppUrl()}/orders/${orderId}"
             style="background-color: #111827; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold;">
             Track Order Status
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send student confirmation email:', err);
  }
}

export async function sendStudentStatusUpdate(params: {
  email: string;
  studentName: string;
  orderNumber: string;
  status: OrderStatus;
  orderId?: string;
}) {
  const { email, studentName, orderNumber, status, orderId } = params;

  if (!email) {
    console.log(`[Email Service] No recipient email for status update: ${orderNumber}`);
    return;
  }

  const statusLabel = ORDER_STATUS_LABELS[status] || status;
  const isReady = status === 'ready';

  try {
    await sendEmail({
      to: email,
      subject: isReady
        ? `Ready for Collection: Order ${orderNumber} - Kairo`
        : `Order ${orderNumber} Status: ${statusLabel}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 560px;">
          <h2>Order Update: ${statusLabel}</h2>
          <p>Hi ${studentName},</p>
          <p>Your print order <strong>${orderNumber}</strong> is now: <strong>${statusLabel}</strong>.</p>
          ${
            isReady
              ? `<div style="padding: 14px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; color: #065f46; margin: 16px 0;">
                  <strong>Pickup Ready:</strong> Your document is printed and waiting for you at the Kairo campus printing desk. Please bring your KCC ID card when collecting.
                 </div>`
              : ''
          }
          ${
            orderId
              ? `<div style="margin-top: 24px;">
                  <a href="${getAppUrl()}/orders/${orderId}"
                     style="display: inline-block; background-color: #111215; color: #ffffff; padding: 10px 20px; text-decoration: none; font-weight: 600; font-size: 13px;">
                     View Order &amp; Pickup Pass &rarr;
                  </a>
                 </div>`
              : ''
          }
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 11px; color: #888;">Kairo Campus Printing &middot; KCC Institute of Technology and Management</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send status update email:', err);
  }
}
