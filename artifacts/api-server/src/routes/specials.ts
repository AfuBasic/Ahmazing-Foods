import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, specialsVotesTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── SPECIALS LIST (hardcoded — rotated by vote, not DB) ───────────────────
export const SPECIALS = [
  {
    name: "Nkwobi",
    description:
      "Spiced cow foot slow-cooked in a palm oil and utazi sauce. Rich, warming and deeply satisfying.",
  },
  {
    name: "Isi Ewu",
    description:
      "Goat head pepper soup — tender meat, aromatic spices. Not for the faint-hearted, but deeply rewarding.",
  },
  {
    name: "Abacha (African Salad)",
    description:
      "Shredded cassava with ugba (oil bean seeds), dried fish, garden eggs and a bold palm oil dressing.",
  },
  {
    name: "Ukwa (Breadfruit Porridge)",
    description:
      "A forgotten treasure. Breadfruit cooked with palm oil, crayfish and seasonings — earthy, filling, unique.",
  },
  {
    name: "Assorted Meat Pepper Soup",
    description:
      "Goat, cow foot, tripe and offal in a light, aromatic pepper soup broth. Warming and deeply flavoured.",
  },
  {
    name: "Roasted Plantain with Pepper & Fish",
    description:
      "Whole plantain roasted over open flame, served with a spiced pepper sauce and your choice of fish — Tilapia or Croaker.",
  },
];

const SPECIALS_NAMES = new Set(SPECIALS.map((s) => s.name));

// ── HELPERS ───────────────────────────────────────────────────────────────

/** Returns the ISO date string for the Monday of the given date's week */
function getMondayOf(now: Date = new Date()): string {
  const d = new Date(now);
  const day = d.getDay(); // 0=Sun ... 6=Sat
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

/** Returns true if voting is currently open (Mon 00:00 → Fri 12:00 Lagos time UTC+1) */
function checkVotingOpen(now: Date = new Date()): boolean {
  const lagosNow = new Date(now.getTime() + 60 * 60 * 1000); // UTC+1
  const day = lagosNow.getUTCDay(); // 0=Sun ... 6=Sat
  const hour = lagosNow.getUTCHours(); // in Lagos time
  if (day === 0 || day === 6) return false; // Saturday or Sunday
  if (day === 5 && hour >= 12) return false; // Friday noon
  return true;
}

/** ISO timestamp of the next Friday noon Lagos time (UTC+1 = 11:00 UTC) */
function getVotingClosesAt(now: Date = new Date()): string {
  const lagosNow = new Date(now.getTime() + 60 * 60 * 1000);
  const lagosDay = lagosNow.getUTCDay();
  const daysUntilFriday = (5 - lagosDay + 7) % 7 || (checkVotingOpen(now) ? 7 : 0);
  const closes = new Date(now);
  closes.setDate(closes.getDate() + daysUntilFriday);
  closes.setUTCHours(11, 0, 0, 0); // 12:00 Lagos = 11:00 UTC
  return closes.toISOString();
}

/** Format a Nigerian phone number so it has no leading zero or + */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  if (!digits.startsWith("234")) return "234" + digits;
  return digits;
}

// ── GET /specials/votes ───────────────────────────────────────────────────
router.get("/specials/votes", async (_req, res): Promise<void> => {
  const now = new Date();
  const weekOf = getMondayOf(now);
  const isVotingOpen = checkVotingOpen(now);

  const rows = await db
    .select({ specialName: specialsVotesTable.specialName, votes: count() })
    .from(specialsVotesTable)
    .where(eq(specialsVotesTable.weekOf, weekOf))
    .groupBy(specialsVotesTable.specialName);

  const voteCounts: Record<string, number> = {};
  for (const row of rows) voteCounts[row.specialName] = Number(row.votes);

  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);

  const options = SPECIALS.map((s) => ({
    name: s.name,
    description: s.description,
    votes: voteCounts[s.name] ?? 0,
  }));

  let winner: string | null = null;
  if (!isVotingOpen && totalVotes > 0) {
    const sorted = [...options].sort((a, b) => b.votes - a.votes);
    winner = sorted[0].name;
  }

  res.json({
    weekOf,
    isVotingOpen,
    votingClosesAt: getVotingClosesAt(now),
    options,
    winner,
    totalVotes,
  });
});

// ── POST /specials/vote ───────────────────────────────────────────────────
router.post("/specials/vote", async (req, res): Promise<void> => {
  const { specialName, voterPhone } = req.body as {
    specialName?: unknown;
    voterPhone?: unknown;
  };

  if (!specialName || typeof specialName !== "string" || !SPECIALS_NAMES.has(specialName)) {
    res.status(400).json({ error: "Invalid special selected" });
    return;
  }

  if (!voterPhone || typeof voterPhone !== "string") {
    res.status(400).json({ error: "Phone number is required" });
    return;
  }

  const phone = normalizePhone(voterPhone);
  if (phone.length < 10) {
    res.status(400).json({ error: "Please enter a valid phone number" });
    return;
  }

  if (!checkVotingOpen()) {
    res.status(400).json({ error: "Voting has closed for this week" });
    return;
  }

  const weekOf = getMondayOf();

  try {
    await db.insert(specialsVotesTable).values({ specialName, weekOf, voterPhone: phone });
    logger.info({ specialName, weekOf }, "Vote recorded");
    res.json({ success: true, message: `Vote recorded for ${specialName}` });
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr?.code === "23505") {
      res.status(409).json({ error: "You have already voted this week" });
    } else {
      logger.error({ err }, "Failed to record vote");
      res.status(500).json({ error: "Could not record vote. Please try again." });
    }
  }
});

export default router;
