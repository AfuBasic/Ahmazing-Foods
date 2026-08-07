import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useListMenuItems } from "@workspace/api-client-react";
import {
  Flame, Trophy, Clock, ChefHat, Phone, Loader2,
  CheckCircle2, AlertCircle, CalendarDays, Share2, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNaira } from "@/lib/format";

const BASE = import.meta.env.BASE_URL;
function getImageUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("assets/")) return `${BASE}${url}`;
  return `${BASE}assets/${url}`;
}

const FALLBACK_BREAKFAST_ITEMS = [
  {
    id: 101,
    name: "Classic Nigerian",
    description: "Serves 2–3. Akara, pap, boiled eggs, fried plantain, and more.",
    sizes: [{ label: "Standard Portion", price: 22000 }],
    imageUrl: "assets/breakfast/classic-nigerian.png",
  },
  {
    id: 102,
    name: "Hearty Plate",
    description: "Serves 2–3. Yam, plantain, egg stew, sausages, side salad, and more.",
    sizes: [{ label: "Standard Portion", price: 22000 }],
    imageUrl: "assets/breakfast/hearty-plate.png",
  },
  {
    id: 103,
    name: "Sweet Start",
    description: "Serves 2–3. Oats, fresh fruit bowl, boiled egg, and more.",
    sizes: [{ label: "Standard Portion", price: 25000 }],
    imageUrl: "assets/breakfast/sweet-start.png",
  },
  {
    id: 104,
    name: "Protein Power",
    description: "Serves 2–3. Moin-moin, akara, pap, boiled eggs, fried plantain, and more.",
    sizes: [{ label: "Standard Portion", price: 25000 }],
    imageUrl: "assets/breakfast/protein-power.png",
  },
];

// ── Types ────────────────────────────────────────────────────────────────────

interface SpecialOption {
  name: string;
  description: string;
  votes: number;
}

interface VotesData {
  weekOf: string;
  isVotingOpen: boolean;
  votingClosesAt: string;
  options: SpecialOption[];
  winner: string | null;
  totalVotes: number;
}

// ── Fish-choice configuration ────────────────────────────────────────────────
// These three dishes require a Tilapia / Croaker choice before voting or sharing.
const FISH_DISH_PATTERNS = ["Ukwa", "Abacha", "Roasted Plantain"];

function needsFish(name: string): boolean {
  return FISH_DISH_PATTERNS.some((p) => name.includes(p));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toWaNumber(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) return "234" + d.slice(1);
  if (!d.startsWith("234")) return "234" + d;
  return d;
}

function formatCountdown(closesAt: string): string {
  const diff = new Date(closesAt).getTime() - Date.now();
  if (diff <= 0) return "Voting has closed";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.ceil(hours / 24)} day${Math.ceil(hours / 24) > 1 ? "s" : ""} left`;
  if (hours > 0) return `${hours}h ${mins}m left to vote`;
  return `${mins} min left to vote`;
}

function maxVotes(options: SpecialOption[]): number {
  return Math.max(...options.map((o) => o.votes), 1);
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function shareUrl(name: string): string {
  const base = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "/weekend-specials";
  return `${base}#${slugify(name)}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function WeekendSpecials() {
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState("");
  const [selectedSpecial, setSelectedSpecial] = useState<string | null>(null);
  const [votedThisWeek, setVotedThisWeek] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");

  // Fish choices per dish (for the 3 that need it)
  const [fishChoices, setFishChoices] = useState<Record<string, "Tilapia" | "Croaker" | "">>({});

  // Copy-link feedback per card
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch vote data
  const { data: votes, isLoading: votesLoading } = useQuery<VotesData>({
    queryKey: ["specials-votes"],
    queryFn: async () => {
      const res = await fetch("/api/specials/votes");
      if (!res.ok) throw new Error("Failed to load votes");
      return res.json();
    },
    refetchInterval: 60_000,
  });

  // Fetch always-available breakfast plates
  const { data: menuData } = useListMenuItems({ category: "breakfast" });
  const displayBreakfastPlates = useMemo(() => {
    if (menuData && menuData.length >= 4) return menuData;
    return FALLBACK_BREAKFAST_ITEMS;
  }, [menuData]);

  // Countdown ticker
  useEffect(() => {
    if (!votes?.votingClosesAt) return;
    const tick = () => setCountdown(formatCountdown(votes.votingClosesAt));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [votes?.votingClosesAt]);

  // Restore voted state from localStorage
  useEffect(() => {
    if (!votes?.weekOf) return;
    const stored = localStorage.getItem(`ahf_voted_${votes.weekOf}`);
    if (stored) setVotedThisWeek(stored);
  }, [votes?.weekOf]);

  // Cast vote mutation
  const castVote = useMutation({
    mutationFn: async ({ specialName, voterPhone }: { specialName: string; voterPhone: string }) => {
      const res = await fetch("/api/specials/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialName, voterPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to vote");
      return data;
    },
    onSuccess: (_data, vars) => {
      if (votes?.weekOf) {
        localStorage.setItem(`ahf_voted_${votes.weekOf}`, vars.specialName);
      }
      setVotedThisWeek(vars.specialName);
      setSelectedSpecial(null);
      queryClient.invalidateQueries({ queryKey: ["specials-votes"] });
    },
  });

  const getFish = (name: string): "Tilapia" | "Croaker" | "" => fishChoices[name] ?? "";

  const handleVote = useCallback(() => {
    if (!selectedSpecial || !phone.trim()) return;
    if (needsFish(selectedSpecial) && !getFish(selectedSpecial)) return;
    castVote.mutate({ specialName: selectedSpecial, voterPhone: phone.trim() });
  }, [selectedSpecial, phone, castVote, fishChoices]);

  async function handleCopyLink(name: string) {
    try {
      await navigator.clipboard.writeText(shareUrl(name));
      setCopiedId(name);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  }

  function buildShareText(name: string): string {
    const fish = getFish(name);
    const dishDisplay = fish ? `${name} (${fish})` : name;
    return `I'm voting for ${dishDisplay} as this weekend's AHmazing Foods special! Join me and vote for your favourite.`;
  }

  const isWeekend = votes ? !votes.isVotingOpen && votes.winner !== null : false;
  const isPreVoting = votes ? !votes.isVotingOpen && votes.winner === null : false;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#2b1a0e] text-white py-20 px-6 rounded-b-[2.5rem]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/50 mb-6">
            <Flame className="w-4 h-4" />
            Weekend Specials
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black leading-none mb-6">
            Dishes we don't<br />
            <span className="text-[#C81212]">cook every day.</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl leading-relaxed">
            Ukwa. Isi Ewu. Abacha. Nkwobi. Pepper Soup. Roasted Plantain. Every week our customers vote for which one we make.
            The winner gets cooked on Saturday — and sold out by Sunday.
          </p>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Phone className="w-5 h-5" />, step: "1", title: "Vote every week", body: "Pick your favourite special and enter your phone. One vote per week, keeps it fair." },
            { icon: <Clock className="w-5 h-5" />, step: "2", title: "Voting closes Friday noon", body: "The special with the most votes gets cooked on Saturday morning." },
            { icon: <ChefHat className="w-5 h-5" />, step: "3", title: "Book before it's gone", body: "Winners go fast. Book your portion before Saturday evening runs out." },
          ].map((item) => (
            <div key={item.step} className="bg-card rounded-2xl p-6 border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold font-display text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Voting section ────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-display font-black">
              {isWeekend ? "This Weekend's Special" : "Vote for This Weekend"}
            </h2>
            {votes?.isVotingOpen && countdown && (
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {countdown}
              </p>
            )}
            {isPreVoting && <p className="text-muted-foreground text-sm mt-1">Voting opens Monday morning.</p>}
          </div>
          {votes?.totalVotes !== undefined && (
            <span className="text-sm text-muted-foreground">
              {votes.totalVotes} {votes.totalVotes === 1 ? "vote" : "votes"} cast this week
            </span>
          )}
        </div>

        {votesLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {votes && !votesLoading && (
          <>
            {/* Winner banner */}
            {isWeekend && votes.winner && (
              <div className="bg-gradient-to-r from-[#C81212] to-[#8b0c0c] text-white rounded-2xl p-8 mb-8 flex items-center gap-5">
                <Trophy className="w-10 h-10 shrink-0" />
                <div>
                  <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">This Weekend</p>
                  <h3 className="text-3xl font-display font-black">{votes.winner}</h3>
                  <p className="text-white/70 mt-1 text-sm">
                    {votes.options.find((o) => o.name === votes.winner)?.description}
                  </p>
                  <a
                    href={`https://wa.me/2348105506052?text=${encodeURIComponent(`Hi! I'd like to book a portion of the weekend special — ${votes.winner}. Please let me know the price and available portions. Thank you!`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 bg-white text-[#C81212] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors"
                  >
                    Book on WhatsApp →
                  </a>
                </div>
              </div>
            )}

            {/* Phone input */}
            {votes.isVotingOpen && !votedThisWeek && (
              <div className="bg-muted/40 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div className="flex-1">
                  <label className="text-sm font-bold mb-1.5 block">Your phone number</label>
                  <p className="text-xs text-muted-foreground mb-2">Used to ensure one vote per person. Not stored publicly.</p>
                  <Input
                    type="tel"
                    placeholder="0812 345 6789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                {selectedSpecial && phone.replace(/\D/g, "").length >= 7 && (
                  (() => {
                    const fishNeeded = needsFish(selectedSpecial) && !getFish(selectedSpecial);
                    return fishNeeded ? (
                      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2 self-end">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        Please choose a fish for {selectedSpecial} before voting.
                      </div>
                    ) : (
                      <Button
                        onClick={handleVote}
                        disabled={castVote.isPending}
                        className="bg-primary text-white hover:bg-primary/90 h-10 px-6"
                      >
                        {castVote.isPending ? (
                          <><Loader2 className="w-4 h-4 animate-spin mr-2" />Voting…</>
                        ) : (
                          `Vote for ${selectedSpecial}`
                        )}
                      </Button>
                    );
                  })()
                )}
              </div>
            )}

            {/* Already voted */}
            {votedThisWeek && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl px-5 py-4 mb-6 flex items-center gap-3 text-green-800 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>You voted for <strong>{votedThisWeek}</strong> this week. Come back Monday to vote again!</span>
              </div>
            )}

            {/* Error */}
            {castVote.isError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{castVote.error.message}</span>
              </div>
            )}

            {/* Specials cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {votes.options.map((option) => {
                const isSelected = selectedSpecial === option.name;
                const isWinner = votes.winner === option.name;
                const isMyVote = votedThisWeek === option.name;
                const barWidth = votes.totalVotes > 0
                  ? Math.round((option.votes / maxVotes(votes.options)) * 100)
                  : 0;
                const hasFish = needsFish(option.name);
                const fish = getFish(option.name);
                const url = shareUrl(option.name);
                const shareText = buildShareText(option.name);
                const isCopied = copiedId === option.name;

                return (
                  <div
                    key={option.name}
                    id={slugify(option.name)}
                    className={[
                      "rounded-2xl border-2 transition-all overflow-hidden flex flex-col",
                      isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card",
                      isWinner ? "border-[#C81212] bg-[#C81212]/5" : "",
                      isMyVote ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "",
                    ].join(" ")}
                  >
                    {/* Clickable vote area */}
                    <button
                      onClick={() => {
                        if (votes.isVotingOpen && !votedThisWeek)
                          setSelectedSpecial(option.name === selectedSpecial ? null : option.name);
                      }}
                      disabled={!votes.isVotingOpen || !!votedThisWeek}
                      className={[
                        "text-left p-5 flex-1",
                        votes.isVotingOpen && !votedThisWeek ? "cursor-pointer" : "cursor-default",
                      ].join(" ")}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold font-display text-base leading-snug pr-2">{option.name}</h3>
                        {isWinner && <Trophy className="w-4 h-4 text-[#C81212] shrink-0" />}
                        {isMyVote && !isWinner && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{option.description}</p>

                      {/* Vote bar */}
                      <div className="space-y-1.5">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isWinner ? "bg-[#C81212]" : isMyVote ? "bg-green-500" : "bg-primary"
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {option.votes} {option.votes === 1 ? "vote" : "votes"}
                          {votes.totalVotes > 0 && ` · ${Math.round((option.votes / votes.totalVotes) * 100)}%`}
                        </p>
                      </div>
                    </button>

                    {/* Fish choice (3 dishes) */}
                    {hasFish && (
                      <div className="px-5 pb-3 border-t border-border/50">
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground block mt-3 mb-2">
                          Fish choice <span className="text-destructive">*</span>
                          {votes.isVotingOpen && !votedThisWeek && (
                            <span className="ml-1 font-normal text-muted-foreground normal-case tracking-normal">
                              (required to vote)
                            </span>
                          )}
                        </label>
                        <div className="flex gap-2">
                          {(["Tilapia", "Croaker"] as const).map((f) => (
                            <button
                              key={f}
                              onClick={() =>
                                setFishChoices((prev) => ({ ...prev, [option.name]: prev[option.name] === f ? "" : f }))
                              }
                              className={[
                                "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                                fish === f
                                  ? "bg-foreground text-background border-foreground"
                                  : "border-border text-muted-foreground hover:border-foreground/40",
                              ].join(" ")}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Share buttons */}
                    <div className="px-5 py-3 border-t border-border/50 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
                        <Share2 className="w-3 h-3" /> Share:
                      </span>
                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                      >
                        WhatsApp
                      </a>
                      {/* Facebook */}
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
                      >
                        Facebook
                      </a>
                      {/* X / Twitter */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-foreground/10 text-foreground hover:bg-foreground/15 transition-colors"
                      >
                        X
                      </a>
                      {/* Copy link */}
                      <button
                        onClick={() => handleCopyLink(option.name)}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors flex items-center gap-1"
                      >
                        {isCopied ? (
                          <><Check className="w-3 h-3 text-green-500" /> Copied!</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy link</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ── Always-available breakfast plates ──────────────────────────────── */}
      <section className="bg-muted/30 border-t border-border py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Always Available</span>
          </div>
          <h2 className="text-3xl font-display font-black mb-3">Weekend Breakfast Combos</h2>
          <p className="text-muted-foreground mb-10">
            While you wait for the weekly special, these combo plates are available every weekend — book by Friday night to secure yours.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayBreakfastPlates.map((item: any) => (
              <div key={item.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
                {/* Photo */}
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {item.imageUrl ? (
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs">
                      Photo coming soon
                    </div>
                  )}
                </div>
                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold font-display text-lg">{item.name}</h3>
                      <span className="text-primary font-bold text-sm whitespace-nowrap ml-2">
                        {formatNaira(Math.min(...item.sizes.map((s: any) => s.price)))}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{item.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.sizes.map((s: any) => (
                        <span key={s.label} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                          {s.label} · {formatNaira(s.price)}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/book?cat=breakfast&item=${encodeURIComponent(item.name)}&size=Standard`}
                      className="mt-auto block w-full text-center text-sm font-bold py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
                      style={{ background: "#0F9E0F" }}
                    >
                      Order →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* ── What's next advice block ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-muted/50 rounded-2xl p-6 border border-border">
          <h3 className="font-bold font-display text-base mb-2">What's next for this feature</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Right now, voting confirms your own pick and gives you something to share — it doesn't yet show a live count everyone can see updating together. That needs a small shared backend to work properly across every visitor at once. This page is built so that piece can be added later without changing anything else here.
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-display font-black mb-4">Ready to book?</h2>
        <p className="text-muted-foreground mb-8">
          Book your weekend special or breakfast combo now. We cook to order — no wasted food, no shortcuts.
        </p>
        <Link href="/book">
          <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-10 h-14 text-base font-bold rounded-full">
            Book Your Slot
          </Button>
        </Link>
      </section>
    </div>
  );
}
