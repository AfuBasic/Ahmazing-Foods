import nodemailer from "nodemailer";
import { logger } from "./logger";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

function getTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    logger.warn("GMAIL_USER or GMAIL_APP_PASSWORD not set — email notifications disabled");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

export interface BookingEmailData {
  orderId: number;
  customerName: string;
  customerPhone: string;
  menuItemName: string;
  category: string;
  selectedSize: string;
  selectedProtein: string | null;
  deliveryDate: string;
  deliverySlot: string;
  itemPrice: number;
  rushFee: number;
  total: number;
  notes: string | null;
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export async function sendBookingNotification(data: BookingEmailData): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const subject = `New Booking #${data.orderId} — ${data.menuItemName} (${data.selectedSize})`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2b2320;">
      <div style="background: #e8440a; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; color: #fff; font-size: 22px;">New Booking — AHmazing Foods</h1>
        <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Order #${data.orderId}</p>
      </div>

      <div style="background: #fdf8f2; padding: 24px; border: 1px solid #e8ddd0; border-top: none; border-radius: 0 0 8px 8px;">

        <h2 style="margin: 0 0 12px; font-size: 16px; color: #e8440a;">Customer Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 6px 0; color: #6b5c55; font-size: 14px; width: 140px;">Name</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: bold;">${data.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b5c55; font-size: 14px;">Phone</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: bold;">${data.customerPhone}</td>
          </tr>
        </table>

        <h2 style="margin: 0 0 12px; font-size: 16px; color: #e8440a;">Order Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 6px 0; color: #6b5c55; font-size: 14px; width: 140px;">Item</td>
            <td style="padding: 6px 0; font-size: 14px;">${data.menuItemName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b5c55; font-size: 14px;">Size</td>
            <td style="padding: 6px 0; font-size: 14px;">${data.selectedSize}</td>
          </tr>
          ${data.selectedProtein ? `
          <tr>
            <td style="padding: 6px 0; color: #6b5c55; font-size: 14px;">Protein</td>
            <td style="padding: 6px 0; font-size: 14px;">${data.selectedProtein}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 6px 0; color: #6b5c55; font-size: 14px;">Delivery Date</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: bold;">${data.deliveryDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b5c55; font-size: 14px;">Delivery Slot</td>
            <td style="padding: 6px 0; font-size: 14px;">${data.deliverySlot}</td>
          </tr>
          ${data.notes ? `
          <tr>
            <td style="padding: 6px 0; color: #6b5c55; font-size: 14px;">Notes</td>
            <td style="padding: 6px 0; font-size: 14px;">${data.notes}</td>
          </tr>` : ""}
        </table>

        <div style="background: #fff; border: 1px dashed #c8b8ad; border-radius: 6px; padding: 16px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px;">
            <span style="color: #6b5c55;">Item price</span>
            <span>${formatNaira(data.itemPrice)}</span>
          </div>
          ${data.rushFee > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px;">
            <span style="color: #e8440a;">Rush fee (&lt;24h booking)</span>
            <span style="color: #e8440a;">${formatNaira(data.rushFee)}</span>
          </div>` : ""}
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; border-top: 1px solid #e8ddd0; padding-top: 10px; margin-top: 4px;">
            <span>Total</span>
            <span style="color: #e8440a;">${formatNaira(data.total)}</span>
          </div>
        </div>

        <p style="margin: 20px 0 0; font-size: 12px; color: #9e8c84;">
          This is an automated notification from AHmazing Foods. Log in to your admin panel to update the order status.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"AHmazing Foods" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject,
      html,
    });
    logger.info({ orderId: data.orderId }, "Booking notification email sent");
  } catch (err) {
    logger.error({ err, orderId: data.orderId }, "Failed to send booking notification email");
  }
}
