"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Target,
  AlertCircle,
  Zap,
  Timer,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Player colors for race visualization
const PLAYER_COLORS = [
  {
    bg: "bg-neon-cyan",
    border: "border-neon-cyan",
    text: "text-neon-cyan",
    glow: "shadow-neon-cyan",
  },
  {
    bg: "bg-neon-magenta",
    border: "border-neon-magenta",
    text: "text-neon-magenta",
    glow: "shadow-neon-magenta",
  },
  {
    bg: "bg-neon-green",
    border: "border-neon-green",
    text: "text-neon-green",
    glow: "shadow-neon-green",
  },
  {
    bg: "bg-neon-orange",
    border: "border-neon-orange",
    text: "text-neon-orange",
    glow: "shadow-neon-orange",
  },
  {
    bg: "bg-neon-purple",
    border: "border-neon-purple",
    text: "text-neon-purple",
    glow: "shadow-neon-purple",
  },
  {
    bg: "bg-neon-pink",
    border: "border-neon-pink",
    text: "text-neon-pink",
    glow: "shadow-neon-pink",
  },
];

export function LiveLeaderboard({
  players,
  currentPlayerId,
  isRaceFinished = false,
}) {
  // Sort players by: finished status → time (for finished) → progress → wpm → accuracy
  const sortedPlayers = [...(players || [])].sort((a, b) => {
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;

    if (a.finished && b.finished) {
      const timeA = typeof a.time === "number" ? a.time : Infinity;
      const timeB = typeof b.time === "number" ? b.time : Infinity;
      if (timeA !== timeB) return timeA - timeB;
      return (b.wpm || 0) - (a.wpm || 0);
    }

    const progressA = a.progress || 0;
    const progressB = b.progress || 0;
    if (progressB !== progressA) {
      return progressB - progressA;
    }
    const wpmA = a.wpm || 0;
    const wpmB = b.wpm || 0;
    if (wpmB !== wpmA) {
      return wpmB - wpmA;
    }
    return (b.accuracy || 0) - (a.accuracy || 0);
  });

  const getPlayerColor = (index) => {
    return PLAYER_COLORS[index % PLAYER_COLORS.length];
  };

  const getRankStyle = (index) => {
    if (index === 0) return "rank-gold";
    if (index === 1) return "rank-silver";
    if (index === 2) return "rank-bronze";
    return "bg-cyber-card border border-cyber-border";
  };

  const getRankIcon = (index) => {
    if (index === 0) return "👑";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <div className="cyber-card p-6">
      <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2 font-gaming">
        <Trophy className="w-5 h-5 text-neon-cyan" />
        <span className="text-glow-cyan">LEADERBOARD</span>
      </h3>
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const isCurrentPlayer = player.socketId === currentPlayerId;
          const playerColor = getPlayerColor(index);
          const isLeader = index === 0 && !isRaceFinished;

          return (
            <div
              key={player.socketId || index}
              className={`relative p-4 rounded-lg transition-all duration-300 ${
                isCurrentPlayer ? "cyber-card-highlight" : "cyber-card"
              } ${isLeader && !player.finished ? "animate-pulse-glow" : ""}`}
              style={isLeader ? { "--glow-color": "#00f0ff" } : {}}
            >
              {/* Leader indicator */}
              {isLeader && !isRaceFinished && (
                <div className="absolute -top-2 -right-2 bg-neon-cyan text-cyber-dark text-xs font-bold px-2 py-1 rounded-full animate-bounce-gentle">
                  LEADING
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${getRankStyle(index)}`}
                  >
                    {index < 3 ? (
                      getRankIcon(index)
                    ) : (
                      <span className="text-white/70">#{index + 1}</span>
                    )}
                  </div>

                  {/* Player color indicator */}
                  <div
                    className={`w-3 h-8 rounded-full ${playerColor.bg} opacity-80`}
                  />

                  {/* Player name */}
                  <div className="flex flex-col">
                    <span
                      className={`font-bold text-lg ${isCurrentPlayer ? "text-neon-cyan text-glow-cyan" : "text-white"}`}
                    >
                      {player.username}
                    </span>
                    <div className="flex gap-2 mt-1">
                      {isCurrentPlayer && (
                        <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 text-xs">
                          YOU
                        </Badge>
                      )}
                      {player.finished && (
                        <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs glow-green">
                          ✓ FINISHED
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* WPM display - prominent */}
                <div className="text-right">
                  <div className="font-gaming text-3xl font-bold text-neon-cyan text-glow-cyan">
                    {player.wpm || 0}
                  </div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">
                    WPM
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                <div className="stat-card p-2">
                  <div className="flex items-center justify-center gap-1 text-neon-green">
                    <Target className="w-3 h-3" />
                    <span className="font-gaming text-lg">
                      {player.accuracy !== undefined ? player.accuracy : 100}%
                    </span>
                  </div>
                  <div className="text-xs text-white/40 text-center">
                    Accuracy
                  </div>
                </div>
                <div className="stat-card p-2">
                  <div className="flex items-center justify-center gap-1 text-neon-magenta">
                    <AlertCircle className="w-3 h-3" />
                    <span className="font-gaming text-lg">
                      {player.errors || 0}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 text-center">
                    Errors
                  </div>
                </div>
                <div className="stat-card p-2">
                  <div className="flex items-center justify-center gap-1 text-neon-orange">
                    <Timer className="w-3 h-3" />
                    <span className="font-gaming text-lg">
                      {player.finished && player.time
                        ? `${typeof player.time === "number" ? player.time.toFixed(1) : player.time}s`
                        : isRaceFinished
                          ? "DNF"
                          : "--"}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 text-center">Time</div>
                </div>
              </div>

              {/* Progress bar */}
              {!isRaceFinished && (
                <div className="relative">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">Progress</span>
                    <span className="text-neon-cyan font-bold">
                      {Math.round(player.progress || 0)}%
                    </span>
                  </div>
                  <div className="progress-neon">
                    <div
                      className="progress-neon-fill"
                      style={{
                        width: `${Math.min(player.progress || 0, 100)}%`,
                        background: `linear-gradient(90deg, ${
                          playerColor.bg === "bg-neon-cyan"
                            ? "#00f0ff"
                            : playerColor.bg === "bg-neon-magenta"
                              ? "#ff00aa"
                              : playerColor.bg === "bg-neon-green"
                                ? "#00ff88"
                                : playerColor.bg === "bg-neon-orange"
                                  ? "#ff6b00"
                                  : playerColor.bg === "bg-neon-purple"
                                    ? "#bf00ff"
                                    : "#ff0080"
                        }, #00ff88)`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* DNF indicator for finished race */}
              {isRaceFinished && !player.finished && (
                <div className="mt-2 text-center">
                  <Badge className="bg-neon-magenta/20 text-neon-magenta border-neon-magenta/30 px-4">
                    DID NOT FINISH - {Math.round(player.progress || 0)}%
                  </Badge>
                </div>
              )}
            </div>
          );
        })}

        {(!players || players.length === 0) && (
          <div className="text-center text-white/50 py-8">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Waiting for players...</p>
          </div>
        )}
      </div>
    </div>
  );
}
