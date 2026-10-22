"use client";

import { useEffect, useState } from "react";

export function PromoBar({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4500);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="bg-sand text-ink">
      <div className="shell flex h-9 items-center justify-center overflow-hidden text-center text-xs font-semibold sm:text-[13px]">
        <p key={index} className="animate-slide-up truncate" aria-live="polite">
          {messages[index]}
        </p>
      </div>
    </div>
  );
}
