"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "../../lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const sb = getBrowserClient();
    sb.auth.getUser().then(({ data }) => setUser(data.user || null));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const sb = getBrowserClient();
    const fn =
      mode === "signup"
        ? sb.auth.signUp({ email, password })
        : sb.auth.signInWithPassword({ email, password });
    const { error } = await fn;
    if (error) {
      setMsg(error.message);
      return;
    }
    if (mode === "signup") {
      setMsg("Check your email if confirmation is on, then come back and sign in.");
      return;
    }
    router.push("/desk");
  }

  async function out() {
    await getBrowserClient().auth.signOut();
    setUser(null);
  }

  return (
    <div className="wrap">
      <header className="top">
        <div className="mark">Lowtide</div>
        <nav>
          <Link href="/">Wall</Link>
          <Link href="/desk">Desk</Link>
          <Link href="/login">Account</Link>
        </nav>
      </header>

      <h1>{user ? "You are in." : "The drawer has a lock."}</h1>
      <p className="lede">
        Email and a password. Public notes go on the wall. Everything else stays on your desk.
      </p>

      <section className="card" style={{ maxWidth: 420, marginTop: 8 }}>
        {user ? (
          <>
            <p className="meta">Signed in as {user.email}</p>
            <div className="row" style={{ marginTop: 14 }}>
              <Link href="/desk">
                <button type="button">Open desk</button>
              </Link>
              <button className="ghost" type="button" onClick={out}>
                Sign out
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <input
              type="email"
              required
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {msg && <p className="err">{msg}</p>}
            <div className="row">
              <button type="submit">{mode === "signup" ? "Create account" : "Sign in"}</button>
              <button
                className="ghost"
                type="button"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              >
                {mode === "signup" ? "Have an account" : "Need an account"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
