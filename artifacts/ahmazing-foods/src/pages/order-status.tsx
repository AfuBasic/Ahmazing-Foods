/**
 * Order Status page — customer-facing delivery tracker.
 * State is fully determined by the URL; no backend needed.
 *
 * URL schemes:
 *   ?stage=preparing | rider_on_the_way | dispatched | delivered  → static message
 *   ?start=<timestamp_ms>                                          → live 10-min countdown
 * If both are present, "start" wins (arrival is most time-sensitive).
 *
 * Timer default: 10 minutes. Override with ?wait=N (minutes).
 */

import { useEffect, useState } from "react";

type Stage =
  | "not-started"
  | "preparing"
  | "rider_on_the_way"
  | "counting"
  | "delivered"
  | "rider_heading_back";

function getUrlParams() {
  const p       = new URLSearchParams(window.location.search);
  const start   = p.get("start");
  const stage   = p.get("stage");
  const wait    = p.get("wait");
  const startTs = start ? parseInt(start, 10) : null;
  const waitMins = wait && !isNaN(Number(wait)) ? Number(wait) : 10; // default 10 min
  return {
    startTs: startTs && !isNaN(startTs) ? startTs : null,
    stage,
    waitMs: waitMins * 60 * 1000,
  };
}

function fmtMs(ms: number): string {
  const secs = Math.max(0, Math.ceil(ms / 1000));
  const m    = Math.floor(secs / 60);
  const s    = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function OrderStatusPage() {
  const [stage,     setStage]     = useState<Stage>("not-started");
  const [countdown, setCountdown] = useState("10:00");
  const [urgent,    setUrgent]    = useState(false);

  useEffect(() => {
    const { startTs, stage: stageParam, waitMs } = getUrlParams();

    if (startTs !== null) {
      // Rider has arrived — live countdown
      let intervalId: ReturnType<typeof setInterval>;

      function tick() {
        const elapsed   = Date.now() - startTs!;
        const remaining = waitMs - elapsed;
        if (remaining <= 0) {
          setStage("rider_heading_back");
          clearInterval(intervalId);
          return;
        }
        setStage("counting");
        setCountdown(fmtMs(remaining));
        setUrgent(remaining <= 2 * 60 * 1000); // last 2 min turns red
      }

      tick();
      intervalId = setInterval(tick, 1000);
      return () => clearInterval(intervalId);
    }

    if (stageParam === "preparing")            setStage("preparing");
    else if (stageParam === "rider_on_the_way" || stageParam === "dispatched")
                                               setStage("rider_on_the_way");
    else if (stageParam === "delivered")       setStage("delivered");
    else if (stageParam === "rider_heading_back") setStage("rider_heading_back");
    else                                       setStage("not-started");

    return undefined;
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FCF1EF", display: "flex", flexDirection: "column" }}>

      {/* Minimal header */}
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

      {/* Progress bar */}
      <ProgressBar stage={stage} />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ maxWidth: 540, width: "100%", textAlign: "center" }}>

          {stage === "not-started" && (
            <StatusCard bg="#F3F4F6" border="#D1D5DB">
              <Icon>🛵</Icon>
              <Title>Your order is confirmed</Title>
              <Sub>
                This tracking link will update automatically — no need to refresh.
                Once our rider is at your doorstep, this page will show a live 10-minute countdown.
              </Sub>
            </StatusCard>
          )}

          {stage === "preparing" && (
            <StatusCard bg="#FFF7ED" border="#FED7AA">
              <Icon>👩‍🍳</Icon>
              <Title>Cooking in Progress</Title>
              <Sub>
                We've started cooking your meal right now. We'll update this page and message you once our rider is on the way.
              </Sub>
            </StatusCard>
          )}

          {stage === "rider_on_the_way" && (
            <StatusCard bg="#F0F4FF" border="#C7D2FE">
              <Icon>🛵</Icon>
              <Title>Rider on the Way</Title>
              <Sub>
                Your meal has left our kitchen and is heading to you.
                Please make sure you — or your recipient — is available to receive.
                This page will switch to a live countdown once the rider arrives at your door.
              </Sub>
              <PolicyNote>
                Our rider waits <strong>10 minutes</strong> at your address. After that, the food is brought back.
              </PolicyNote>
            </StatusCard>
          )}

          {stage === "counting" && (
            <StatusCard bg="#fff" border="#D1D5DB">
              <Icon>🚪</Icon>
              <Title>Rider Waiting — At Your Doorstep</Title>
              <Sub>
                Our rider has arrived. Please send someone out to collect your order <strong>before the timer runs out.</strong>
              </Sub>
              <div style={{
                fontFamily: "monospace",
                fontSize: "4rem",
                fontWeight: 800,
                color: urgent ? "#C81212" : "#0F9E0F",
                margin: "24px 0 8px",
                lineHeight: 1,
                transition: "color 0.5s",
              }}>
                {countdown}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginBottom: 20 }}>minutes remaining</div>
              <PolicyNote urgent>
                If nobody collects in time, the rider heads back. A <strong>new delivery fee</strong> applies to redeliver.
                If redelivery also fails, the order is <strong>cancelled</strong> with no refund.
              </PolicyNote>
            </StatusCard>
          )}

          {stage === "delivered" && (
            <StatusCard bg="#EFF7EC" border="#B8DDB0">
              <Icon>✅</Icon>
              <Title style={{ color: "#166534" }}>Delivered — enjoy your meal!</Title>
              <Sub>Thank you for ordering from AHmazing Foods. We hope you love it. 🍲</Sub>
            </StatusCard>
          )}

          {stage === "rider_heading_back" && (
            <StatusCard bg="#FDF0EE" border="#E8B4AA">
              <Icon>↩️</Icon>
              <Title style={{ color: "#991B1B" }}>Rider Heading Back</Title>
              <Sub>
                The 10-minute wait window has passed and our rider is returning the food to our kitchen.
                Your order has <strong>not been delivered</strong>.
              </Sub>

              {/* Policy box */}
              <div style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 20,
                textAlign: "left",
              }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#991B1B", marginBottom: 10 }}>
                  What happens next — please read
                </p>
                <ul style={{ color: "#7F1D1D", fontSize: 13, lineHeight: 1.7, paddingLeft: 18 }}>
                  <li>To get your food delivered again, you must pay a <strong>new delivery fee</strong> — contact us on WhatsApp.</li>
                  <li>If a second delivery attempt also fails, your order is <strong>cancelled with no refund</strong> on food or fees.</li>
                  <li>AHmazing Foods is not responsible for changes to food quality after a missed delivery. We cooked it right.</li>
                </ul>
              </div>

              <a
                href="https://wa.me/2348105506052?text=Hi%2C%20the%20rider%20came%20back%20after%20my%20missed%20delivery%20%E2%80%94%20I'd%20like%20to%20arrange%20redelivery"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  background: "#25D366",
                  color: "#fff",
                  padding: "13px 28px",
                  borderRadius: 999,
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: 15,
                }}
              >
                💬 Arrange Redelivery on WhatsApp
              </a>
              <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 12 }}>
                Redelivery is subject to a new fee and rider availability.
              </p>
            </StatusCard>
          )}

        </div>
      </div>

      <div style={{ background: "#221F1F", color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "16px 20px", fontSize: 13 }}>
        AHmazing Foods · Lagos, Nigeria · +234 (810)-550-6052
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
const STAGE_ORDER: Stage[] = [
  "not-started", "preparing", "rider_on_the_way", "counting", "delivered",
];

function ProgressBar({ stage }: { stage: Stage }) {
  const steps = [
    { key: "preparing",        label: "Cooking" },
    { key: "rider_on_the_way", label: "On the Way" },
    { key: "counting",         label: "At Your Door" },
    { key: "delivered",        label: "Delivered" },
  ] as const;

  const currentIdx = STAGE_ORDER.indexOf(stage);
  const isFailed   = stage === "rider_heading_back";

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", gap: 0 }}>
        {steps.map((step, i) => {
          const stepIdx = STAGE_ORDER.indexOf(step.key as Stage);
          const done    = !isFailed && currentIdx > stepIdx;
          const active  = !isFailed && currentIdx === stepIdx;
          return (
            <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isFailed ? "#FEE2E2" : done ? "#0F9E0F" : active ? "#221F1F" : "#E5E7EB",
                  border: `2px solid ${isFailed ? "#FCA5A5" : done ? "#0F9E0F" : active ? "#221F1F" : "#E5E7EB"}`,
                  fontSize: 11, fontWeight: 700, color: done || active ? "#fff" : "#9CA3AF",
                  zIndex: 1,
                  marginLeft: i === 0 ? "auto" : undefined,
                  marginRight: i === steps.length - 1 ? "auto" : undefined,
                }}>
                  {done ? "✓" : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    flex: 1, height: 2,
                    background: done ? "#0F9E0F" : "#E5E7EB",
                    transition: "background 0.3s",
                  }} />
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: active ? "#221F1F" : done ? "#0F9E0F" : "#9CA3AF" }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {isFailed && (
        <p style={{ textAlign: "center", fontSize: 12, color: "#C81212", fontWeight: 700, marginTop: 6 }}>
          ↩ Rider Heading Back — delivery not completed
        </p>
      )}
    </div>
  );
}

// ── Presentational helpers ─────────────────────────────────────────────────────
function StatusCard({ bg, border, children }: { bg: string; border: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: 20, padding: "36px 28px",
      boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
    }}>
      {children}
    </div>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "3rem", marginBottom: 16 }}>{children}</div>;
}

function Title({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: 12, lineHeight: 1.3, ...style }}>
      {children}
    </div>
  );
}

function Sub({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ color: "rgba(34,31,31,0.7)", fontSize: "0.95rem", lineHeight: 1.65, marginBottom: 24, ...style }}>
      {children}
    </div>
  );
}

function PolicyNote({ children, urgent }: { children: React.ReactNode; urgent?: boolean }) {
  return (
    <div style={{
      background: urgent ? "#FEF2F2" : "#F9FAFB",
      border: `1px solid ${urgent ? "#FECACA" : "#E5E7EB"}`,
      borderRadius: 10,
      padding: "12px 16px",
      fontSize: "0.82rem",
      color: urgent ? "#7F1D1D" : "#6B7280",
      lineHeight: 1.6,
      textAlign: "left",
    }}>
      {children}
    </div>
  );
}
