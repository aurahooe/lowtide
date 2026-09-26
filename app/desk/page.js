"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "../../lib/supabase";

export default function Desk() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [notes, setNotes] = useState([]);
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [err, setErr] = useState("");

  async function load(sb, uid) {
    const { data } = await sb
      .from("lowtide_notes")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setNotes(data || []);
  }

  useEffect(() => {
    const sb = getBrowserClient();
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setUser(null);
        router.replace("/login");
        return;
      }
      setUser(data.user);
      load(sb, data.user.id);
    });
  }, [router]);

  async function save(e) {
    e.preventDefault();
    setErr("");
    const sb = getBrowserClient();
    const { error } = await sb.from("lowtide_notes").insert({
      user_id: user.id,
      body: body.trim(),
      is_public: isPublic,
    });
    if (error) {
      setErr(error.message);
      return;
    }
    setBody("");
    load(sb, user.id);
  }

  async function toggle(n) {
    const sb = getBrowserClient();
    await sb.from("lowtide_notes").update({ is_public: !n.is_public }).eq("id", n.id);
    load(sb, user.id);
  }

  async function remove(n) {
    const sb = getBrowserClient();
    await sb.from("lowtide_notes").delete().eq("id", n.id);
    load(sb, user.id);
  }

  if (!user) return <div className="wrap">Opening the drawer…</div>;

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

      <h1>Your drawer.</h1>
      <p className="lede">
        Private by default. Tick the box and it walks out onto the wall.
      </p>

      <div className="grid two">
        <section className="card">
          <h2>Write</h2>
          <form onSubmit={save}>
            <textarea
              required
              maxLength={4000}
              placeholder="Something small. A sentence you do not want to lose."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <label className="check">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Pin to the public wall
            </label>
            {err && <p className="err">{err}</p>}
            <button type="submit">Keep this</button>
          </form>
        </section>

        <section className="card" style={{ animationDelay: "80ms" }}>
          <h2>Kept</h2>
          {notes.length === 0 && <p className="meta">Empty drawer.</p>}
          {notes.map((n, i) => (
            <article className="note" key={n.id} style={{ animationDelay: `${i * 30}ms` }}>
              <p>{n.body}</p>
              <div className="meta">
                {n.is_public ? "on the wall" : "in the drawer"}
                {" · "}
                {new Date(n.created_at).toLocaleString()}
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <button className="ghost" type="button" onClick={() => toggle(n)}>
                  {n.is_public ? "Pull off the wall" : "Pin to the wall"}
                </button>
                <button className="ghost" type="button" onClick={() => remove(n)}>
                  Burn
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
