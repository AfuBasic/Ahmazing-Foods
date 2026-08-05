/**
 * Google Calendar integration for AHmazing Foods.
 * Creates a delivery event on the business calendar (primary = ahmazingfoodsorders@gmail.com)
 * whenever an order is placed. Customers receive an attendee invite if they supplied an email.
 *
 * Reminder: 4 hours (240 min) before the delivery slot — both popup and email.
 */

import { ReplitConnectors } from "@replit/connectors-sdk";
import { logger } from "./logger";

// ── Delivery slot → [startHour, endHour] in 24h, Lagos (WAT = UTC+1) ────────
const SLOT_HOURS: Record<string, [number, number]> = {
  "10am–12pm": [10, 12],
  "12–2pm":    [12, 14],
  "2–4pm":     [14, 16],
  "4–6pm":     [16, 18],
};

function slotToDateTime(
  dateStr: string,  // "YYYY-MM-DD"
  slot:    string,
): { start: string; end: string } {
  const [startH, endH] = SLOT_HOURS[slot] ?? [10, 12];
  // WAT offset "+01:00" — Google Calendar respects the offset even if timeZone is also set
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    start: `${dateStr}T${pad(startH)}:00:00+01:00`,
    end:   `${dateStr}T${pad(endH)}:00:00+01:00`,
  };
}

// ── Naira formatter (no Intl dependency needed here) ─────────────────────────
function fmtNaira(kobo: number): string {
  return `₦${kobo.toLocaleString("en-NG")}`;
}

// ── Public interface ──────────────────────────────────────────────────────────
export interface DeliveryEventParams {
  orderId:         number;
  customerName:    string;
  customerEmail?:  string | null;
  customerPhone?:  string | null;
  deliveryAddress: string | null;
  deliveryDate:    string;   // "YYYY-MM-DD"
  deliverySlot:    string;   // "10am–12pm" | "12–2pm" | "2–4pm" | "4–6pm"
  menuItemName:    string;
  total:           number;
  notes?:          string | null;
}

export async function createDeliveryCalendarEvent(
  params: DeliveryEventParams,
): Promise<void> {
  const { start, end } = slotToDateTime(params.deliveryDate, params.deliverySlot);

  // Attendees: customer only if they gave an email (business calendar is already the owner)
  const attendees = params.customerEmail
    ? [{ email: params.customerEmail, displayName: params.customerName }]
    : [];

  const descLines = [
    `Order #${params.orderId}`,
    `Customer: ${params.customerName}${params.customerPhone ? ` · ${params.customerPhone}` : ""}`,
    `Items: ${params.menuItemName}`,
    params.deliveryAddress ? `Address: ${params.deliveryAddress}` : "",
    `Total: ${fmtNaira(params.total)}`,
    "",
    "---",
    "Payment: FCMB · Ahmazing Cuisine · 1009414545",
    params.notes ? `\nCustomer notes: ${params.notes}` : "",
  ].filter((l) => l !== undefined);

  const event = {
    summary:     `🍲 Delivery — ${params.customerName} (Order #${params.orderId})`,
    description: descLines.join("\n"),
    start:       { dateTime: start, timeZone: "Africa/Lagos" },
    end:         { dateTime: end,   timeZone: "Africa/Lagos" },
    attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 240 }, // 4-hour popup reminder
        { method: "email", minutes: 240 }, // 4-hour email reminder
      ],
    },
    colorId: "5", // banana — easy to spot on a busy calendar
  };

  try {
    const connectors = new ReplitConnectors();
    const response = await connectors.proxy(
      "google-calendar",
      "/calendars/primary/events",
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(event),
      },
    );

    const data = await response.json() as { id?: string; error?: { message?: string } };

    if (data.error) {
      logger.error(
        { calendarError: data.error, orderId: params.orderId },
        "Google Calendar event creation failed",
      );
    } else {
      logger.info(
        { calendarEventId: data.id, orderId: params.orderId },
        "Google Calendar delivery event created",
      );
    }
  } catch (err) {
    logger.error(
      { err, orderId: params.orderId },
      "Exception while creating Google Calendar event",
    );
  }
}
