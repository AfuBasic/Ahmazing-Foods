/**
 * Order Status page — customer-facing delivery tracker.
 * State is fully determined by the URL; no backend needed.
 *
 * URL schemes:
 *   ?stage=preparing | dispatched | delivered  → static message
 *   ?start=<timestamp>                         → live 15-min countdown
 * If both are present, "start" wins (arrival is most time-sensitive).
 */

import { useEffect, useState, useRef } from "react";

type Stage = "not-started" | "preparing" | "dispatched" | "counting" | "delivered" | "expired";

function getUrlParams() {
  const p = new URLSearchParams(window.location.search);
  const start = p.get("start");
  const stage = p.get("stage");
  const wait  = p.get("wait");
  const startTs   = start ? parseInt(start, 10) : null;
  const waitMins  = wait && !isNaN(Number(wait)) ? Number(wait) : 15;
  return {
    startTs: startTs && !isNaN(startTs) ? startTs : null,
    stage,
    waitMs: waitMins * 60 * 1000,
  };
}

function fmtMs(ms: number): string {
  const secs = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function OrderStatusPage() {
  const [stage, setStage] = useState<Stage>("not-started");
  const [countdown, setCountdown] = useState("15:00");
  const [urgent, setUrgent] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const { startTs, stage: stageParam, waitMs } = getUrlParams();

    if (startTs !== null) {
      // Arrived — live countdown (duration configurable via ?wait=N minutes)
      let intervalId: ReturnType<typeof setInterval>;

      function tick() {
        const elapsed = Date.now() - startTs!;
        const remaining = waitMs - elapsed;
        if (remaining <= 0) {
          setStage("expired");
          if (intervalId) clearInterval(intervalId);
          return;
        }
        setStage("counting");
        setCountdown(fmtMs(remaining));
        setUrgent(remaining <= 3 * 60 * 1000);
      }

      tick();
      intervalId = setInterval(tick, 1000);
      intervalRef.current = intervalId;
      return () => clearInterval(intervalId);
    }

    if (stageParam === "preparing")       setStage("preparing");
    else if (stageParam === "dispatched") setStage("dispatched");
    else if (stageParam === "delivered")  setStage("delivered");
    else                                  setStage("not-started");

    return undefined;
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FCF1EF", display: "flex", flexDirection: "column" }}>
      {/* Minimal header — no full nav needed on this tracking page */}
      <div style={{ background: "#C81212", color: "#fff", fontSize: 12, padding: "6px 20px", display: "flex", gap: 16 }}>
        <span>+234 (810)-550-6052</span>
        <span>ahmazingfoodsorders@gmail.com</span>
        <span>Lagos State.</span>
      </div>
      <div style={{ background: "#fff", padding: "14px 24px", borderBottom: "1px solid #e5e7eb" }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 18, color: "#221F1F", textDecoration: "none" }}>
          <span style={{ color: "#C81212" }}>AH</span>mazing Foods
        </a>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          {stage === "not-started" && (
            <StatusCard bg="#F3F4F6" border="#D1D5DB">
              <Icon>🛵</Icon>
              <Title>Your order is on the way</Title>
              <Sub>This page will show a live countdown once our rider arrives at your delivery address. Keep this link — no need to refresh, it updates on its own.</Sub>
            </StatusCard>
          )}

          {stage === "preparing" && (
            <StatusCard bg="#F3F4F6" border="#D1D5DB">
              <Icon>👩‍🍳</Icon>
              <Title>Your order is being prepared</Title>
              <Sub>We've started cooking. We'll message you again once it's dispatched.</Sub>
            </StatusCard>
          )}

          {stage === "dispatched" && (
            <StatusCard bg="#F3F4F6" border="#D1D5DB">
              <Icon>🛵</Icon>
              <Title>Your order is dispatched</Title>
              <Sub>Your order has left our kitchen and is on its way to you. We'll message you once our rider has arrived, with a live countdown for pickup.</Sub>
            </StatusCard>
          )}

          {stage === "counting" && (
            <StatusCard bg="#fff" border="#D1D5DB">
              <Icon>⏰</Icon>
              <Title>We've arrived and we're waiting</Title>
              <Sub>Please send someone out to collect your order before the timer runs out.</Sub>
              <div style={{
                fontFamily: "monospace",
                fontSize: "3.2rem",
                fontWeight: 700,
                color: urgent ? "#C81212" : "#0F9E0F",
                margin: "20px 0",
                transition: "color 0.3s",
              }}>
                {countdown}
              </div>
              <Sub style={{ marginBottom: 0 }}>
                If nobody collects in time, the order returns to our kitchen and a new delivery fee applies for redelivery.
              </Sub>
            </StatusCard>
          )}

          {stage === "delivered" && (
            <StatusCard bg="#EFF7EC" border="#B8DDB0">
              <Icon>✅</Icon>
              <Title style={{ color: "#166534" }}>Delivered — enjoy your meal!</Title>
              <Sub>Thank you for ordering from AHmazing Foods. We hope you love it. 🍲</Sub>
            </StatusCard>
          )}

          {stage === "expired" && (
            <StatusCard bg="#FDF0EE" border="#E8B4AA">
              <Icon>↩️</Icon>
              <Title style={{ color: "#991B1B" }}>Waiting time has expired</Title>
              <Sub>We're sorry we missed you. Your order is being returned to our kitchen. Message us on WhatsApp to arrange redelivery — a new delivery fee will apply.</Sub>
              <a
                href="https://wa.me/2348105506052?text=Hi%2C%20my%20order%20was%20returned%20after%20a%20missed%20delivery%20—%20I'd%20like%20to%20arrange%20redelivery"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 16,
                  background: "#0F9E0F",
                  color: "#fff",
                  padding: "12px 28px",
                  borderRadius: 999,
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: 15,
                }}
              >
                Message Us on WhatsApp
              </a>
            </StatusCard>
          )}
        </div>
      </div>

      <div style={{ background: "#221F1F", color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "16px 20px", fontSize: 13 }}>
        AHmazing Foods · Lagos, Nigeria
      </div>
    </div>
  );
}

// ── Small presentational helpers ──────────────────────────────────────────────

function StatusCard({ bg, border, children }: { bg: string; border: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 16,
      padding: "36px 28px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    }}>
      {children}
    </div>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "3rem", marginBottom: 14 }}>{children}</div>;
}

function Title({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: 10, lineHeight: 1.3, ...style }}>
      {children}
    </div>
  );
}

function Sub({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ color: "rgba(34,31,31,0.7)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 24, ...style }}>
      {children}
    </div>
  );
}
