"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, AlertCircle, Clock, Zap, Timer } from "lucide-react";

export function LiveLeaderboard({
  players,
  currentPlayerId,
  isRaceFinished = false,
}) {
  // Sort players by: finished status → time (for finished) → progress → wpm → accuracy
  const sortedPlayers = [...(players || [])].sort((a, b) => {
    // Finished players always come first
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;

    if (a.finished && b.finished) {
      // Both finished - sort by time (lower is better)
      const timeA = typeof a.time === "number" ? a.time : Infinity;
      const timeB = typeof b.time === "number" ? b.time : Infinity;
      if (timeA !== timeB) return timeA - timeB;
      // Same time, sort by WPM (higher is better)
      return (b.wpm || 0) - (a.wpm || 0);
    }

    // Both not finished - sort by progress (higher is better)
    const progressA = a.progress || 0;
    const progressB = b.progress || 0;
    if (progressB !== progressA) {
      return progressB - progressA;
    }
    // Same progress, sort by WPM (higher is better)
    const wpmA = a.wpm || 0;
    const wpmB = b.wpm || 0;
    if (wpmB !== wpmA) {
      return wpmB - wpmA;
    }
    // Same WPM, sort by accuracy (higher is better)
    return (b.accuracy || 0) - (a.accuracy || 0);
  });

  const getRankIcon = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Live Leaderboard
        </h3>
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => {
            const isCurrentPlayer = player.socketId === currentPlayerId;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg transition-all ${
                  isCurrentPlayer
                    ? "bg-blue-500/20 border-2 border-blue-500"
                    : "bg-gray-900/50 border border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white min-w-[40px]">
                      {getRankIcon(index)}
                    </span>
                    <span
                      className={`font-bold ${
                        isCurrentPlayer ? "text-blue-300" : "text-white"
                      }`}
                    >
                      {player.username}
                    </span>
                    {isCurrentPlayer && (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                        You
                      </Badge>
                    )}
                    {player.finished && (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        Finished
                      </Badge>
                    )}
                  </div>
                </div>
                <div
                  className={`grid ${
                    isRaceFinished
                      ? "grid-cols-2 md:grid-cols-5"
                      : "grid-cols-4"
                  } gap-2 text-sm`}
                >
                  {/* Show progress during race, or final progress when finished */}
                  {!isRaceFinished && (
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-white/70">Progress:</span>
                      <span className="text-white font-bold">
                        {Math.round(player.progress || 0)}%
                      </span>
                    </div>
                  )}
                  {isRaceFinished && (
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-white/70">Progress:</span>
                      <span className="text-white font-bold">
                        {player.finished
                          ? "100%"
                          : `${Math.round(player.progress || 0)}%`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-white/70">WPM:</span>
                    <span className="text-white font-bold text-lg">
                      {player.wpm || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-white/70">Accuracy:</span>
                    <span className="text-white font-bold">
                      {player.accuracy !== undefined ? player.accuracy : 100}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-white/70">Errors:</span>
                    <span className="text-white font-bold">
                      {player.errors || 0}
                    </span>
                  </div>
                  {isRaceFinished && (
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4 text-cyan-400" />
                      <span className="text-white/70">Time:</span>
                      <span className="text-cyan-300 font-bold">
                        {player.finished && player.time
                          ? `${
                              typeof player.time === "number"
                                ? player.time.toFixed(1)
                                : player.time
                            }s`
                          : "DNF"}
                      </span>
                    </div>
                  )}
                </div>
                {!player.finished && !isRaceFinished && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(player.progress || 0, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                {isRaceFinished && !player.finished && (
                  <div className="mt-2 text-center">
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                      Did Not Finish
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
