"use client";

import { useEffect, useState } from "react";

export function RaceCountdown({ countdown, onCountdownEnd }) {
  const [displayCountdown, setDisplayCountdown] = useState(countdown);
  const [animateKey, setAnimateKey] = useState(0);

  useEffect(() => {
    setDisplayCountdown(countdown);
    setAnimateKey(prev => prev + 1);
    if (countdown === 0) {
      setTimeout(() => {
        if (onCountdownEnd) onCountdownEnd();
      }, 500);
    }
  }, [countdown, onCountdownEnd]);

  if (countdown === null || countdown < 0) return null;

  const getCountdownColor = () => {
    if (countdown === 3) return "text-red-500";
    if (countdown === 2) return "text-yellow-500";
    if (countdown === 1) return "text-orange-500";
    return "text-green-400";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="text-center relative">
        {/* Animated circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            key={`ring-${animateKey}`}
            className="w-64 h-64 rounded-full border-4 border-white/20 animate-ping"
            style={{ animationDuration: '1s' }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={`w-48 h-48 rounded-full ${countdown > 0 ? 'bg-white/10' : 'bg-green-500/20'}`}
          />
        </div>
        
        {/* Countdown number */}
        {countdown > 0 ? (
          <div 
            key={animateKey}
            className={`text-[12rem] font-black ${getCountdownColor()} relative z-10 countdown-number`}
            style={{
              animation: 'countdownPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              textShadow: '0 0 60px currentColor, 0 0 120px currentColor',
            }}
          >
            {countdown}
          </div>
        ) : (
          <div 
            key="go"
            className="text-8xl font-black text-green-400 relative z-10"
            style={{
              animation: 'goAnimation 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              textShadow: '0 0 60px #4ade80, 0 0 120px #4ade80',
            }}
          >
            GO!
          </div>
        )}

        {/* Subtitle */}
        <p className="text-white/60 text-xl mt-4 font-medium">
          {countdown > 0 ? "Get ready..." : "Start typing!"}
        </p>
      </div>

      <style jsx>{`
        @keyframes countdownPop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes goAnimation {
          0% {
            transform: scale(0.3) rotate(-10deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.3) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

