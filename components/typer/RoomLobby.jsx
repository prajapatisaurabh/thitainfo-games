"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Check, Play, Loader2 } from "lucide-react";
import { useSocket } from "@/lib/socket/client";

export function RoomLobby({ roomId, isHost, onStartRace, roomData, socket }) {
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roomData && roomData.players) {
      const playerExists = roomData.players.some(
        (p) => p.socketId === socket?.id
      );
      setJoined(playerExists);
    }
  }, [roomData, socket]);

  const handleJoinRoom = async () => {
    if (!username.trim() || !socket) return;

    setLoading(true);
    socket.emit("join-room", { roomId, username });

    socket.once("joined-room", () => {
      setJoined(true);
      setLoading(false);
    });

    socket.once("error", (error) => {
      alert(error.message || "Error joining room");
      setLoading(false);
    });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!joined) {
    return (
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 text-white">Join Room</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">
                Enter your username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="bg-gray-900/50 border-white/10 text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleJoinRoom();
                }}
              />
            </div>
            <Button
              onClick={handleJoinRoom}
              disabled={!username.trim() || loading}
              className="w-full btn-cartoon bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Room"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Room: {roomId}</h3>
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            {roomData?.players?.length || 0} / {roomData?.maxPlayers || 10}
          </Badge>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Players</span>
          </div>
          <div className="space-y-2">
            {roomData?.players?.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white">{player.username}</span>
                  {player.socketId === socket?.id && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                      You
                    </Badge>
                  )}
                  {roomData?.hostId === player.socketId && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                      Host
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <Button
            onClick={copyRoomCode}
            variant="outline"
            className="w-full bg-gray-900/50 border-white/10 text-white hover:bg-gray-800/50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Room Code
              </>
            )}
          </Button>
        </div>

        {isHost && roomData?.players?.length > 0 && (
          <Button
            onClick={onStartRace}
            disabled={roomData?.status !== "waiting"}
            className="w-full btn-cartoon bg-green-600 hover:bg-green-700 text-white border-0"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Race
          </Button>
        )}

        {roomData?.status === "starting" && (
          <div className="text-center text-white/70 mt-4">
            Race starting soon...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

