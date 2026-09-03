"use client";

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { SITE_URL } from "@/lib/site";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { error } = await getBrowserClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    /*
      Deliberately vague. Distinguishing "no such account" from "wrong
      password" tells an attacker which addresses are real.
    */
    if (error) setError("That email and password did not match.");
    setBusy(false);
  }

  /*
    Sends the recovery link to /admin/reset. The redirect target has to be on
    the Supabase project's allow-list (Authentication -> URL Configuration),
    so SITE_URL is used rather than window.location — a preview deployment
    would otherwise send a link that the project refuses to honour.
  */
  async function recover() {
    const address = email.trim();
    if (!address) {
      setError("Enter your email address first.");
      return;
    }

    setSending(true);
    setError(null);

    const { error } = await getBrowserClient().auth.resetPasswordForEmail(
      address,
      { redirectTo: `${SITE_URL}/admin/reset` },
    );

    if (error) {
      /*
        The built-in Supabase mailer allows only a couple of messages an hour.
        Saying so beats "something went wrong" when the fix is to wait.
      */
      setError(
        /rate limit/i.test(error.message)
          ? "Too many emails requested. Wait an hour, or set the password from the Supabase dashboard."
          : error.message,
      );
    } else {
      /* Deliberately vague about whether the address exists. */
      setSent(true);
    }

    setSending(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[320px]">
        <h1
          className="font-display text-3xl leading-tight text-ink"
          style={{ fontVariationSettings: '"SOFT" 40, "WONK" 1' }}
        >
          Trinketory
          <span className="block text-ink-faint">Admin</span>
        </h1>

        <label className="label mt-10 block text-ink-faint" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border-b border-line bg-transparent py-2 text-caption text-ink focus:border-ink focus:outline-none"
        />

        <label className="label mt-6 block text-ink-faint" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border-b border-line bg-transparent py-2 text-caption text-ink focus:border-ink focus:outline-none"
        />

        {error && <p className="mt-5 text-caption text-accent">{error}</p>}

        {sent && (
          <p className="mt-5 text-caption leading-relaxed text-ink-muted">
            If that address has an account, a reset link is on its way. It
            lasts about an hour and works once.
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="label mt-8 w-full bg-ink py-3.5 text-canvas transition-colors hover:bg-accent disabled:bg-surface-deep disabled:text-ink-muted"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <button
          type="button"
          onClick={recover}
          disabled={sending || sent}
          className="label mt-5 w-full text-ink-faint transition-colors hover:text-ink disabled:hover:text-ink-faint"
        >
          {sending ? "Sending…" : sent ? "Link sent" : "Forgot password?"}
        </button>
      </form>
    </div>
  );
}
