// src/components/CountdownBanner.jsx
import { useEffect, useMemo, useState } from "react";

/**
 * Full-bleed pink banner that matches user requirements:
 * Text and timer grouped, timer has background padding, labels are inline (D, H, M, S).
 */
export default function CountdownBanner({ days = 7 }) {
  const target = useMemo(() => Date.now() + days * 24 * 60 * 60 * 1000, [days]);
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    // FULL BLEED pink bar — the main container covering the full width
    <div id="countdown-banner" className=" bg-[#ef3577] text-white">
      {/* 
        This inner div centers the content block within the viewport.
        Using 'justify-center' keeps the text and timer visually grouped together.
      */}
      <div className="flex items-center justify-center max-w-full mx-auto px-4 md:px-16 py-2 gap-4">
        
        {/* Left label matching the image text appearance */}
        <div>
          <span className="text-sm md:text-base font-medium">
              Registration ends in:
          </span>
        </div>

        <div 
            className="inline-flex items-center gap-3 rounded-lg px-3 py-2 bg-[rgba(220,220,220,0.34)]" 
        >
          {/* Time blocks with inline labels D, H, M, S */}
          <TimeBlockInline value={timeLeft.days} label="D" />
          <TimeBlockInline value={timeLeft.hours} label="H" />
          <TimeBlockInline value={timeLeft.minutes} label="M" />
          <TimeBlockInline value={timeLeft.seconds} label="S" />
        </div>
      </div>
    </div>
  );
}

/* --- Helpers Below --- */

// Helper function modified to show number and label inline
function TimeBlockInline({ value, label }) {
  const v = String(Math.max(0, value)).padStart(2, "0");
  return (
    // This inline flex div keeps number and label together
    <div className="flex items-center select-none">
      <div className="text-sm md:text-base font-semibold text-white">{v}</div>
      {/* Added margin-left for slight gap between number and label */}
      <div className="text-[10px] md:text-xs text-white/80 ml-1">{label}</div>
    </div>
  );
}

// Function to calculate time left (Kept separate days for 'D' label)
function calcTimeLeft(targetTs) {
  const now = Date.now();
  const diff = Math.max(0, targetTs - now);
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds };
}
