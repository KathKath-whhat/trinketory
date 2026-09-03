"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";

type Phase = "checking" | "ready" | "invalid" | "saving" | "done";

/* Long enough to be worth having, short enough that nobody gives up. */
const MIN_LENGTH = 10;

const input =
  "mt-2 w-full border-b border-line bg-transparent py-2 text-caption text-ink focus:border-ink focus:outline-none";

/*
  Set a new admin password from a recovery link.

  The link Supabase emails carries a token in the URL. The browser client
  parses it on construction (detectSessionInUrl) and exchanges it for a
  short-lived session — that session is the only thing authorising the
  updateUser call below, which is why this page has to wait for it rather
  than rendering the form immediately.

  This route is deliberately exempt from the admin auth gate in the layout:
  by definition nobody arriving here can sign in yet.
*/
export default function AdminResetPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserClient();
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setPhase((p) => (p === "checking" ? "ready" : p));
    });

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) {
        setPhase((p) => (p === "checking" ? "ready" : p));
      }
    });

    /*
      Parsing the token is asynchronous, so an absent session is only
      meaningful after a grace period — checking once would call a valid
      link invalid.
    */
    const timer = setTimeout(() => {
      if (active) setPhase((p) => (p === "checking" ? "invalid" : p));
    }, 5000);

    return () => {
      active = false;
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setPhase("saving");
    const { error: err } = await getBrowserClient().auth.updateUser({
      password,
    });

    if (err) {
      setError(err.message);
      setPhase("ready");
      return;
    }

    setPhase("done");
    /* The recovery session is a real session, so this lands signed in. */
    setTimeout(() => router.push("/admin"), 1200);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[320px]">
        <h1
          className="font-display text-3xl leading-tight text-ink"
          style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
        >
          Trinketory
          <span className="block text-ink-faint">New password</span>
        </h1>

        {phase === "checking" && (
          <p className="label mt-10 text-ink-faint">Checking your link…</p>
        )}

        {phase === "invalid" && (
          <div className="mt-10">
            <p className="text-caption leading-relaxed text-ink-muted">
              This link has expired or has already been used. Recovery links
              last about an hour and only work once.
            </p>
            <Link
              href="/admin"
              className="label mt-8 inline-block border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Request a new one
            </Link>
          </div>
        )}

        {phase === "done" && (
          <div className="mt-10">
            <p className="text-caption leading-relaxed text-ink-muted">
              Password changed. Taking you to the admin panel…
            </p>
          </div>
        )}

        {(phase === "ready" || phase === "saving") && (
          <form onSubmit={save} className="mt-10">
            <label className="label block text-ink-faint" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              autoFocus
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />

            <label
              className="label mt-6 block text-ink-faint"
              htmlFor="confirm"
            >
              Again, to be sure
            </label>
            <input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={input}
            />

            <p className="mt-3 text-caption text-ink-faint">
              At least {MIN_LENGTH} characters. This account controls the whole
              catalogue, so make it one you do not use anywhere else.
            </p>

            {error && <p className="mt-5 text-caption text-accent">{error}</p>}

            <button
              type="submit"
              disabled={phase === "saving"}
              className="label mt-8 w-full bg-ink py-3.5 text-canvas transition-colors hover:bg-accent disabled:bg-surface-deep disabled:text-ink-muted"
            >
              {phase === "saving" ? "Saving…" : "Set password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
