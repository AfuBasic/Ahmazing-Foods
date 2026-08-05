/**
 * Staff Order Links — internal tool for riders/kitchen staff.
 * Generates per-stage WhatsApp messages with the order status link embedded.
 * NOT linked from any customer-facing nav. noindex.
 */

import { useState } from "react";

const ORDER_STATUS_URL = "https://ahmazingfoods.com/order-status";

type Stage = "preparing" | "dispatched" | "arrived" | "delivered";

const STAGES: { id: Stage; label: string; emoji: string; primary?: boolean }[] = [
  { id: "preparing",  label: "Preparing Meal",               emoji: "👩‍🍳" },
  { id: "dispatched", label: "Dispatched",                    emoji: "🛵" },
  { id: "arrived",    label: "Arrived — Start 15-Min Timer",  emoji: "⏰", primary: true },
  { id: "delivered",  label: "Delivered",                     emoji: "✅" },
];

function buildLink(stage: Stage): string {
  if (stage === "arrived") return `${ORDER_STATUS_URL}?start=${Date.now()}`;
  return `${ORDER_STATUS_URL}?stage=${stage}`;
}

function buildGreeting(name: string): string {
  return name.trim() ? `Hi ${name.trim()}, ` : "";
}

function buildMessage(stage: Stage, greeting: string): string {
  const link = buildLink(stage);
  switch (stage) {
    case "preparing":
      return `${greeting}Your AHmazing Foods order is being prepared! We'll message you again once it's dispatched. Track it here: ${link}`;
    case "dispatched":
      return `${greeting}Your AHmazing Foods order is dispatched and on its way! We'll message you again once our rider has arrived. Track it here: ${link}`;
    case "arrived":
      return `${greeting}We've arrived with your AHmazing Foods order! Please send someone out to collect it. Track your 15-minute pickup window here: ${link}`;
    case "delivered":
      return `${greeting}Delivered! Enjoy your AHmazing Foods order. Thank you for ordering with us: ${link}`;
  }
}

export default function StaffOrderLinksPage() {
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy Message");

  function handleStage(stage: Stage) {
    const greeting = buildGreeting(recipientName);
    setMessage(buildMessage(stage, greeting));
    setCopyLabel("Copy Message");
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy Message"), 1500);
    } catch {
      alert("Copy this message:\n\n" + message);
    }
  }

  function openWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9", padding: "0 0 60px" }}>
      {/* No customer-facing header — staff tool only */}
      <div style={{ background: "#221F1F", color: "#fff", padding: "14px 20px", fontSize: 13, textAlign: "center" }}>
        Staff Tool — Order Status Links · Not for customers
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.4rem", marginBottom: 6, textAlign: "center" }}>
          Order Status Links
        </h1>
        <p style={{ color: "#555", fontSize: "0.88rem", textAlign: "center", marginBottom: 24 }}>
          For riders/kitchen staff only. Tap a stage to generate that update's message, then send it to the customer on WhatsApp.
        </p>

        <div style={{
          background: "#fff8e6",
          border: "1px solid #e5d5a0",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: "0.8rem",
          color: "#555",
          marginBottom: 24,
          textAlign: "center",
        }}>
          Not every order needs all 4 — for quick orders, skip straight to Dispatched. For bigger or slower orders, using all 4 helps reassure the customer.
        </div>

        {/* Name field */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: 6 }}>
            Who is this message going to?
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="e.g. Chidinma, or Chidinma's driver Emeka"
            style={{
              width: "100%",
              padding: "11px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          <div style={{ fontSize: "0.75rem", color: "#888", marginTop: 5 }}>
            Type it once — it fills into every stage message below. Leave blank to skip the greeting.
          </div>
        </div>

        {/* Stage buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStage(s.id)}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 10,
                border: s.primary ? "none" : "2px solid #ddd",
                background: s.primary ? "#0F9E0F" : "#fff",
                color: s.primary ? "#fff" : "#221F1F",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Message output */}
        {message && (
          <>
            <textarea
              readOnly
              value={message}
              rows={5}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 8,
                border: "1px solid #ddd",
                fontFamily: "inherit",
                fontSize: "0.88rem",
                lineHeight: 1.5,
                background: "#f5f5f5",
                resize: "none",
                boxSizing: "border-box",
                marginBottom: 12,
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={copyMessage}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 8,
                  border: "2px solid #ddd",
                  background: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {copyLabel}
              </button>
              <button
                type="button"
                onClick={openWhatsApp}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 8,
                  border: "none",
                  background: "#25D366",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Open in WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
