"use client";

import { Flag, Zap } from "lucide-react";

// Player colors for race visualization
const PLAYER_COLORS = [
  { bg: "#00f0ff", trail: "#00f0ff60", name: "Cyan" },
  { bg: "#ff00aa", trail: "#ff00aa60", name: "Magenta" },
  { bg: "#00ff88", trail: "#00ff8860", name: "Green" },
  { bg: "#ff6b00", trail: "#ff6b0060", name: "Orange" },
  { bg: "#bf00ff", trail: "#bf00ff60", name: "Purple" },
  { bg: "#ff0080", trail: "#ff008060", name: "Pink" },
  { bg: "#ffff00", trail: "#ffff0060", name: "Yellow" },
  { bg: "#0080ff", trail: "#0080ff60", name: "Blue" },
];

export function RaceTrack({ players, currentPlayerId }) {
  // Sort by progress for visual display
  const sortedPlayers = [...(players || [])].sort((a, b) => {
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    return (b.progress || 0) - (a.progress || 0);
  });

  const getPlayerColor = (index) => {
    return PLAYER_COLORS[index % PLAYER_COLORS.length];
  };

  // Find original index for consistent coloring
  const getOriginalIndex = (player) => {
    return (players || []).findIndex((p) => p.socketId === player.socketId);
  };

  return (
    <div className="cyber-card p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-gaming">
          <Zap className="w-5 h-5 text-neon-cyan" />
          <span className="text-glow-cyan">RACE TRACK</span>
        </h3>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Flag className="w-4 h-4" />
          <span>FINISH</span>
        </div>
      </div>

      <div className="race-track p-4">
        {/* Finish line */}
        <div className="finish-line" />

        {/* Track lanes */}
        {sortedPlayers.map((player, displayIndex) => {
          const originalIndex = getOriginalIndex(player);
          const color = getPlayerColor(originalIndex);
          const isCurrentPlayer = player.socketId === currentPlayerId;
          const progress = Math.min(player.progress || 0, 100);

          return (
            <div key={player.socketId || displayIndex} className="race-lane">
              {/* Track background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

              {/* Progress trail */}
              <div
                className="race-trail"
                style={{
                  width: `calc(${progress}% - 20px)`,
                  background: `linear-gradient(90deg, transparent, ${color.trail})`,
                  left: "40px",
                }}
              />

              {/* Player avatar */}
              <div
                className="race-avatar"
                style={{
                  left: `calc(${progress}% - 18px + 40px)`,
                  background: color.bg,
                  boxShadow: `0 0 20px ${color.bg}, 0 0 40px ${color.trail}`,
                  border: isCurrentPlayer
                    ? "3px solid white"
                    : "2px solid transparent",
                }}
              >
                <span className="text-cyber-dark font-bold text-xs">
                  {player.username?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>

              {/* Player name label */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-2 z-20">
                <span
                  className={`text-xs font-medium truncate max-w-[60px] ${
                    isCurrentPlayer ? "text-white font-bold" : "text-white/70"
                  }`}
                >
                  {player.username?.slice(0, 6) || "Player"}
                </span>
              </div>

              {/* WPM indicator */}
              <div className="absolute right-12 top-1/2 -translate-y-1/2 text-right z-20">
                <span
                  className="font-gaming text-sm font-bold"
                  style={{
                    color: color.bg,
                    textShadow: `0 0 10px ${color.trail}`,
                  }}
                >
                  {player.wpm || 0}
                </span>
                <span className="text-white/40 text-xs ml-1">WPM</span>
              </div>

              {/* Finished indicator */}
              {player.finished && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
                  <span className="text-neon-green text-lg">🏁</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {(!players || players.length === 0) && (
          <div className="race-lane justify-center">
            <span className="text-white/30 text-sm">Waiting for racers...</span>
          </div>
        )}

        {/* Track markers */}
        <div className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-between px-10 text-xs text-white/30">
          <span>START</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>FINISH</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {sortedPlayers.slice(0, 6).map((player, index) => {
          const originalIndex = getOriginalIndex(player);
          const color = getPlayerColor(originalIndex);
          const isCurrentPlayer = player.socketId === currentPlayerId;

          return (
            <div
              key={player.socketId || index}
              className={`flex items-center gap-2 px-2 py-1 rounded ${
                isCurrentPlayer ? "bg-white/10" : ""
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: color.bg,
                  boxShadow: `0 0 8px ${color.trail}`,
                }}
              />
              <span
                className={`text-xs ${isCurrentPlayer ? "text-white font-bold" : "text-white/60"}`}
              >
                {player.username?.slice(0, 8) || "Player"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
