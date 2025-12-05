"use client";

import { useEffect, useState } from "react";

export function RaceCountdown({ countdown, onCountdownEnd }) {
  const [displayCountdown, setDisplayCountdown] = useState(countdown);

  useEffect(() => {
    setDisplayCountdown(countdown);
    if (countdown === 0) {
      setTimeout(() => {
        if (onCountdownEnd) onCountdownEnd();
      }, 500);
    }
  }, [countdown, onCountdownEnd]);

  if (countdown === null || countdown < 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center">
        {countdown > 0 ? (
          <div className="text-9xl font-bold text-white animate-pulse">
            {countdown}
          </div>
        ) : (
          <div className="text-7xl font-bold text-green-400 animate-bounce">
            GO!
          </div>
        )}
      </div>
    </div>
  );
}

