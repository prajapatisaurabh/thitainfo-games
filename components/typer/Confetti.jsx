"use client";

import { useEffect, useState } from "react";

export function Confetti({ active = false }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const colors = [
        "#FFD700", // Gold
        "#FF6B6B", // Red
        "#4ECDC4", // Teal
        "#45B7D1", // Blue
        "#96CEB4", // Green
        "#FFEAA7", // Yellow
        "#DDA0DD", // Plum
        "#98D8C8", // Mint
      ];

      const newParticles = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
      }));

      setParticles(newParticles);

      // Clear confetti after animation
      const timer = setTimeout(() => {
        setParticles([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: "-20px",
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confettiFall ${particle.duration}s ease-out ${particle.delay}s forwards`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

