"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "../lib/supabase";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [pulse, setPulse] = useState(null);
  const [user, setUser] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const sb = getBrowserClient();
    sb.auth.getUser().then(({ data }) => setUser(data.user || null));
    sb.from("lowtide_notes")
      .select("id, body, created_at, lowtide_profiles(handle, display_name)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setNotes(data || []));
    sb.from("lowtide_hours")
      .select("*")
      .order("hour_stamp", { ascending: false })
      .limit(1)
      .then(({ data }) => setPulse(data?.[0] || null));
  }, []);

  const progress = useMemo(() => {
    const m = now.getMinutes();
    const s = now.getSeconds();
    return ((m * 60 + s) / 3600) * 100;
  }, [now]);

  return (
    <div className="wrap">
      <header className="top">
        <div className="mark">Lowtide</div>
        <nav>
          <Link href="/">Wall</Link>
          <Link href="/desk">Desk</Link>
          <Link href="/login">{user ? "Account" : "Sign in"}</Link>
        </nav>
      </header>

      <h1>When the water pulls back,<br />the shore keeps what people left.</h1>
      <p className="lede">
        Write something and pin it to the wall, or leave it in your drawer.
        Only public scraps show here. Every hour the room prints a new dispatch.
      </p>

      <div className="clock">
        <span className="dot" />
        {now.toLocaleString(undefined, {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
        <div className="bar" title="until the next hour">
          <i style={{ width: progress + "%" }} />
        </div>
      </div>

      <div className="grid two">
        <section className="card">
          <h2>The wall</h2>
          {notes.length === 0 && <p className="meta">Quiet. The first public note will sit here.</p>}
          {notes.map((n, i) => (
            <article className="note" key={n.id} style={{ animationDelay: `${i * 35}ms` }}>
              <p>{n.body}</p>
              <div className="meta">
                {n.lowtide_profiles?.display_name ||
                  n.lowtide_profiles?.handle ||
                  "someone"}
                {" · "}
                {new Date(n.created_at).toLocaleString()}
              </div>
            </article>
          ))}
        </section>

        <aside className="card" style={{ animationDelay: "90ms" }}>
          <h2>This hour</h2>
          {pulse ? (
            <>
              <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "1.35rem", margin: "0 0 8px" }}>
                {pulse.title}
              </p>
              <p style={{ lineHeight: 1.55 }}>{pulse.body}</p>
              <div className="meta" style={{ marginTop: 10 }}>
                {new Date(pulse.hour_stamp).toLocaleString()}
              </div>
            </>
          ) : (
            <p>Waiting on the first tide.</p>
          )}
        </aside>
      </div>

      <footer>Paper, salt, one copper thread. Not a feed.</footer>
    </div>
  );
}
