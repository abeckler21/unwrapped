"use client";

import { useEffect, useState } from "react";

type Props = {
  shareHref: string;
};

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function ShareActions({ shareHref }: Props) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (copyStatus === "idle") return;
    const t = window.setTimeout(() => setCopyStatus("idle"), 2200);
    return () => window.clearTimeout(t);
  }, [copyStatus]);

  async function handleShare() {
    const url = new URL(shareHref, window.location.origin).toString();

    // Native share sheet (iOS/Android, Chrome Android, Safari)
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ url });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        // Non-abort error: fall through to navigate
      }
      return;
    }

    // Desktop fallback: navigate to the share page
    window.location.href = url;
  }

  async function handleCopy() {
    const url = new URL(shareHref, window.location.origin).toString();
    try {
      await copyText(url);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <div className="mt-1 flex flex-col gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="button-primary justify-center"
      >
        Share your score
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="button-secondary justify-center text-sm"
        aria-live="polite"
      >
        {copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Copy failed" : "Copy link"}
      </button>
    </div>
  );
}
