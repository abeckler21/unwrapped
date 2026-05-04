"use client";

import Link from "next/link";
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
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (status === "idle") {
      return;
    }

    const timeout = window.setTimeout(() => setStatus("idle"), 2200);
    return () => window.clearTimeout(timeout);
  }, [status]);

  async function handleCopy() {
    const url = new URL(shareHref, window.location.origin).toString();

    try {
      await copyText(url);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="mt-1 flex flex-col gap-2">
      <Link href={shareHref} className="button-primary justify-center">
        Share your score
      </Link>
      <button
        type="button"
        onClick={handleCopy}
        className="button-secondary justify-center text-sm"
        aria-live="polite"
      >
        {status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Copy link"}
      </button>
    </div>
  );
}
