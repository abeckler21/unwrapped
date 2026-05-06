"use client";

import { useEffect, useState } from "react";

type Props = {
  sessionId: string;
};

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = value;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export function ShareLink({ sessionId }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const path = `/compare/${sessionId}`;

  useEffect(() => {
    if (status === "idle") return;
    const t = window.setTimeout(() => setStatus("idle"), 2200);
    return () => clearTimeout(t);
  }, [status]);

  async function handleCopy() {
    const url = new URL(path, window.location.origin).toString();
    try {
      await copyText(url);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* URL display — shows path; copy handler builds the full absolute URL */}
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-[var(--text-muted)]">
          {path}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="button-primary shrink-0 py-1.5 text-sm"
          aria-live="polite"
        >
          {status === "copied" ? "Copied!" : status === "failed" ? "Failed" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        Link expires in 7 days. When your friend opens it and logs in, you&apos;ll both see the comparison.
      </p>
    </div>
  );
}
