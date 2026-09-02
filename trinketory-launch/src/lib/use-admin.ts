"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";

export type AdminState =
  | { status: "loading" }
  | { status: "signed-out" }
  /* Signed in, but not on the admin list. */
  | { status: "forbidden"; email: string }
  | { status: "ready"; email: string };

/*
  Resolves who is looking at the admin panel.

  Being signed in is not the same as being an admin, so this checks both:
  a session, and a row in public.admins. The admins table is itself
  RLS-protected — a non-admin selecting from it gets zero rows rather than
  an error, which is exactly the signal we want.

  This gate is a convenience for rendering, not a security boundary. The
  real enforcement is in the database: even if someone forced this to
  return "ready", every write policy would still reject them.
*/
export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({ status: "loading" });

  useEffect(() => {
    const supabase = getBrowserClient();
    let active = true;

    async function resolve(email: string | undefined) {
      if (!email) {
        if (active) setState({ status: "signed-out" });
        return;
      }

      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .limit(1);

      if (!active) return;

      setState(
        !error && data && data.length > 0
          ? { status: "ready", email }
          : { status: "forbidden", email },
      );
    }

    supabase.auth
      .getSession()
      .then(({ data }) => resolve(data.session?.user.email));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      resolve(session?.user.email);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
