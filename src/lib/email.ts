import { Resend } from 'resend';
import { ADMIN_EMAIL, APP_NAME } from '@/lib/constants';
import { OrderStatus, ORDER_STATUS_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.FROM_EMAIL || 'Kairo <notifications@kairo.kccitm.org>';

export async function sendAdminOrderNotification(params: {
  orderId: string;
  orderNumber: string;
  studentName: string;
  studentKccId: string;
  totalAmount: number;
  fileCount: number;
}) {
  const { orderId, orderNumber, studentName, studentKccId, totalAmount, fileCount } = params;

  if (!resend) {
    console.log(`[Email Service Mock] New order ${orderNumber} placed by ${studentName} (${studentKccId}) - Total: ${formatCurrency(totalAmount)}`);
    return;
  }

  try {
    await resend.emails.send({
      from: fromEmail,
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
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders/${orderId}"
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

  if (!resend || !email) {
    console.log(`[Email Service Mock] Order confirmation for ${orderNumber} sent to ${email}`);
    return;
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Order Confirmed: ${orderNumber} - Kairo KCC Printing`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2>Order Received!</h2>
          <p>Hi ${studentName},</p>
          <p>We received your print order <strong>${orderNumber}</strong> for ${formatCurrency(totalAmount)}.</p>
          <p>Our campus desk will process your printout shortly. You will be notified once it is ready for collection.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${orderId}"
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
}) {
  const { email, studentName, orderNumber, status } = params;

  if (!resend || !email) {
    console.log(`[Email Service Mock] Status update for ${orderNumber} (${status}) sent to ${email}`);
    return;
  }

  const statusLabel = ORDER_STATUS_LABELS[status] || status;
  const isReady = status === 'ready';

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: isReady
        ? `Ready for Collection: Order ${orderNumber} - Kairo`
        : `Order ${orderNumber} Status: ${statusLabel}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2>Order Update: ${statusLabel}</h2>
          <p>Hi ${studentName},</p>
          <p>Your print order <strong>${orderNumber}</strong> is now: <strong>${statusLabel}</strong>.</p>
          ${
            isReady
              ? `<p style="padding: 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; color: #065f46;">
                  Your document is printed and waiting for you at the Kairo campus printing desk. Please bring your KCC ID card when collecting.
                 </p>`
              : ''
          }
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send status update email:', err);
  }
}
