"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  Play,
  Loader2,
  Trophy,
  Clock,
  Target,
  AlertCircle,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useSocket } from "@/lib/socket/client";
import { RoomLobby } from "@/components/typer/RoomLobby";
import { LiveLeaderboard } from "@/components/typer/LiveLeaderboard";
import { RaceCountdown } from "@/components/typer/RaceCountdown";
import { Confetti } from "@/components/typer/Confetti";

function RacePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket, isConnected } = useSocket();
  const [roomId, setRoomId] = useState(""); // Active room ID (after joining)
  const [roomCodeInput, setRoomCodeInput] = useState(""); // Input field value
  const [username, setUsername] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [autoJoined, setAutoJoined] = useState(false);
  const [raceStarted, setRaceStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [raceResults, setRaceResults] = useState(null);
  const [maxPlayersInput, setMaxPlayersInput] = useState(10); // Configurable max players
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Check if joining via room code from URL
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setRoomCodeInput(code);
    }
  }, [searchParams]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("room-update", (data) => {
      setRoomData(data);
      if (data.hostId === socket.id) {
        setIsHost(true);
      }
    });

    socket.on("race-countdown", (data) => {
      setCountdown(data.countdown);
    });

    socket.on("race-started", () => {
      setCountdown(null);
      setRaceStarted(true);
      setTimeElapsed(0);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });

    socket.on("race-finished", (data) => {
      // Race ended - show results to all players
      setShowResults(true);
      setRaceStarted(false); // Stop the race
      
      // Clear all timers immediately
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      if (data.results) {
        setRaceResults({
          players: data.results.sort((a, b) => {
            if (a.finished && !b.finished) return -1;
            if (!a.finished && b.finished) return 1;
            if (a.finishedAt && b.finishedAt) {
              return new Date(a.finishedAt) - new Date(b.finishedAt);
            }
            return (b.wpm || 0) - (a.wpm || 0);
          }),
          winner: data.winner,
        });
      }
    });

    socket.on("error", (error) => {
      alert(error.message || "An error occurred");
    });

    socket.on("disconnect", () => {
      alert("Connection lost. Please refresh the page.");
    });

    socket.on("connect", () => {
      // Rejoin room if disconnected
      if (roomId && username) {
        socket.emit("join-room", { roomId, username });
      }
    });

    return () => {
      socket.off("room-update");
      socket.off("race-countdown");
      socket.off("race-started");
      socket.off("race-finished");
      socket.off("error");
      socket.off("disconnect");
      socket.off("connect");
    };
  }, [socket, roomId, username]);

  // Timer for race with timeout (5 minutes)
  useEffect(() => {
    if (raceStarted && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 0.1;
          // Race timeout after 5 minutes
          if (newTime >= 300) {
            handleRaceFinish();
            return 300;
          }
          return newTime;
        });
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [raceStarted, showResults]);

  // Progress tracking
  useEffect(() => {
    if (raceStarted && socket && roomId && userInput.length > 0) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        const text = roomData?.text || "";
        const progress =
          text.length > 0 ? (userInput.length / text.length) * 100 : 0;
        const timeInMinutes = timeElapsed / 60;
        const wordsTyped = userInput.trim().split(/\s+/).length;
        const wpm =
          timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0;

        let correctChars = 0;
        const minLength = Math.min(userInput.length, text.length);
        for (let i = 0; i < minLength; i++) {
          if (userInput[i] === text[i]) {
            correctChars++;
          }
        }
        const accuracy =
          userInput.length > 0
            ? Math.round((correctChars / userInput.length) * 100)
            : 100;

        let errors = 0;
        for (let i = 0; i < minLength; i++) {
          if (userInput[i] !== text[i]) {
            errors++;
          }
        }

        const finished = userInput === text;

        socket.emit("player-progress", {
          roomId,
          progress,
          wpm,
          accuracy,
          errors,
          finished,
        });

        if (finished && !showResults) {
          handleRaceFinish();
        }
      }, 500);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [
    raceStarted,
    socket,
    roomId,
    userInput,
    timeElapsed,
    roomData,
    showResults,
  ]);

  const handleCreateRoom = async () => {
    if (!socket || !username.trim()) {
      alert("Please enter a username");
      return;
    }

    try {
      const response = await fetch("/api/typer/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: socket.id, maxPlayers: maxPlayersInput }),
      });

      const data = await response.json();
      if (data.success) {
        const newRoomId = data.data.roomId;
        setRoomId(newRoomId);
        setRoomCodeInput(newRoomId);
        setIsHost(true);
        setAutoJoined(true);
        // Join room via socket - host automatically joins when creating
        socket.emit("join-room", { roomId: newRoomId, username });
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Error creating room");
    }
  };

  const handleJoinRoom = async () => {
    if (!socket || !username.trim() || !roomCodeInput.trim()) {
      alert("Please enter username and room code");
      return;
    }

    try {
      const response = await fetch("/api/typer/join-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: roomCodeInput }),
      });

      const data = await response.json();
      if (data.success) {
        setRoomId(roomCodeInput); // Set actual roomId only after successful join validation
        socket.emit("join-room", { roomId: roomCodeInput, username });
      } else {
        alert(data.message || "Error joining room");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Error joining room");
    }
  };

  const handleStartRace = () => {
    if (socket && roomId) {
      socket.emit("start-race", { roomId });
    }
  };

  const handleRaceFinish = async () => {
    // The server will broadcast race-finished event to all players
    // This is called when the current player finishes typing
    const text = roomData?.text || "";
    const timeInMinutes = timeElapsed / 60;
    const wordsTyped = text.trim().split(/\s+/).length;
    const finalWpm =
      timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0;

    let correctChars = 0;
    const minLength = Math.min(userInput.length, text.length);
    for (let i = 0; i < minLength; i++) {
      if (userInput[i] === text[i]) {
        correctChars++;
      }
    }
    const accuracy =
      userInput.length > 0
        ? Math.round((correctChars / userInput.length) * 100)
        : 100;

    let errors = 0;
    for (let i = 0; i < minLength; i++) {
      if (userInput[i] !== text[i]) {
        errors++;
      }
    }

    // Emit player finished event to server
    if (socket && roomId) {
      socket.emit("player-finished", {
        roomId,
        wpm: finalWpm,
        accuracy,
        errors,
        time: timeElapsed,
      });
    }
  };

  const handleInputChange = (e) => {
    if (!raceStarted || countdown !== null) return;
    setUserInput(e.target.value);
  };

  // Prevent paste to avoid cheating
  const handlePaste = (e) => {
    e.preventDefault();
    alert("Pasting is not allowed! Type the text yourself.");
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const text = roomData?.text || "";
    if (text.length === 0) return 0;
    return Math.min((userInput.length / text.length) * 100, 100);
  };

  const getCharacterClass = (index) => {
    if (index >= userInput.length) return "text-gray-400";
    if (userInput[index] === (roomData?.text || "")[index])
      return "text-green-400";
    return "text-red-400 bg-red-400/20";
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen gradient-dark animate-gradient text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Connecting to server...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!roomId || !roomData) {
    return (
      <div className="min-h-screen gradient-dark animate-gradient text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <Link
            href="/typer"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Typer
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Race Mode</h1>

          <div className="max-w-md mx-auto space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6">
                {/* Username Section */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3 text-white">
                    Your Details
                  </h2>
                  <label className="text-white/70 text-sm mb-2 block">Username</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-gray-900/50 border-white/10 text-white"
                  />
                </div>

                {/* Create Room Section */}
                <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <h3 className="text-lg font-semibold mb-3 text-blue-300">Create New Room</h3>
                  <div className="mb-3">
                    <label className="text-white/70 text-sm mb-2 block">Max Players</label>
                    <Input
                      type="number"
                      value={maxPlayersInput}
                      onChange={(e) => setMaxPlayersInput(Math.max(2, Math.min(50, parseInt(e.target.value) || 2)))}
                      placeholder="Max players (2-50)"
                      min={2}
                      max={50}
                      className="bg-gray-900/50 border-white/10 text-white"
                    />
                    <p className="text-white/50 text-xs mt-1">Set how many players can join (2-50)</p>
                  </div>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={!username.trim()}
                    className="w-full btn-cartoon bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Create Room
                  </Button>
                </div>

                <div className="text-center text-white/50 mb-6">— OR —</div>

                {/* Join Room Section */}
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <h3 className="text-lg font-semibold mb-3 text-green-300">Join Existing Room</h3>
                  <div className="mb-3">
                    <label className="text-white/70 text-sm mb-2 block">Room Code</label>
                    <Input
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="Enter 6-digit room code"
                      className="bg-gray-900/50 border-white/10 text-white"
                      maxLength={6}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          username.trim() &&
                          roomCodeInput.trim()
                        ) {
                          handleJoinRoom();
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!username.trim() || !roomCodeInput.trim()}
                    className="w-full btn-cartoon bg-green-600 hover:bg-green-700 text-white border-0"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Join Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (showResults && raceResults) {
    const isWinner = raceResults.winner?.socketId === socket?.id;
    return (
      <div className="min-h-screen gradient-dark animate-gradient text-white">
        <Confetti active={isWinner} />
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-white/30 backdrop-blur-sm max-w-3xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-4xl font-bold mb-2 text-white">
                  Race Complete!
                </h2>
                {raceResults.winner && (
                  <div className="mt-4">
                    <p className="text-white/70 text-lg">Winner</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      🏆 {raceResults.winner.username} 🏆
                    </p>
                    <p className="text-white/80 mt-1">
                      {raceResults.winner.wpm} WPM •{" "}
                      {raceResults.winner.accuracy}% accuracy
                    </p>
                  </div>
                )}
                {isWinner && (
                  <div className="mt-4 p-4 bg-yellow-500/20 rounded-lg border-2 border-yellow-500">
                    <p className="text-2xl font-bold text-yellow-400">
                      🎉 Congratulations! You Won! 🎉
                    </p>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold mb-4 text-white">Leaderboard</h3>
              <div className="space-y-3">
                {raceResults.players.map((player, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg transition-all ${
                      index === 0
                        ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-500"
                        : index === 1
                        ? "bg-gradient-to-r from-gray-400/20 to-gray-300/20 border border-gray-400"
                        : index === 2
                        ? "bg-gradient-to-r from-orange-700/20 to-orange-600/20 border border-orange-600"
                        : "bg-gray-900/50 border border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold">
                          {index === 0
                            ? "🥇"
                            : index === 1
                            ? "🥈"
                            : index === 2
                            ? "🥉"
                            : `#${index + 1}`}
                        </span>
                        <div>
                          <span className="font-bold text-white text-lg">
                            {player.username}
                          </span>
                          <div className="flex gap-2 mt-1">
                            {player.socketId === socket?.id && (
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                You
                              </Badge>
                            )}
                            {player.finished ? (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                Finished
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                                DNF
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {player.wpm || 0} WPM
                        </div>
                        <div className="text-sm text-white/70">
                          {player.accuracy || 0}% accuracy
                        </div>
                        {player.finished && player.time && (
                          <div className="text-sm text-green-400 font-medium">
                            ⏱️{" "}
                            {typeof player.time === "number"
                              ? player.time.toFixed(1)
                              : player.time}
                            s
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <Button
                  onClick={() => {
                    setRoomId("");
                    setRoomCodeInput("");
                    setRoomData(null);
                    setRaceStarted(false);
                    setShowResults(false);
                    setRaceResults(null);
                    setUserInput("");
                    setTimeElapsed(0);
                    setAutoJoined(false);
                    setIsHost(false);
                    setCountdown(null);
                    // Clear timers
                    if (timerRef.current) {
                      clearInterval(timerRef.current);
                      timerRef.current = null;
                    }
                    if (progressIntervalRef.current) {
                      clearInterval(progressIntervalRef.current);
                      progressIntervalRef.current = null;
                    }
                  }}
                  className="flex-1 btn-cartoon bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  <Play className="w-4 h-4 mr-2" />
                  New Race
                </Button>
                <Button
                  onClick={() => router.push("/typer")}
                  className="flex-1 btn-cartoon bg-gray-600 hover:bg-gray-700 text-white border-0"
                >
                  Back to Typer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark animate-gradient text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <Link
          href="/typer"
          className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Typer
        </Link>

        {countdown !== null && <RaceCountdown countdown={countdown} />}

        {!raceStarted ? (
          <div className="grid md:grid-cols-2 gap-6">
            <RoomLobby
              roomId={roomId}
              isHost={isHost}
              onStartRace={handleStartRace}
              roomData={roomData}
              socket={socket}
              autoJoined={autoJoined}
            />
            {roomData && roomData.players && roomData.players.length > 0 && (
              <LiveLeaderboard
                players={roomData.players}
                currentPlayerId={socket?.id}
                isRaceFinished={false}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <LiveLeaderboard
                players={roomData?.players || []}
                currentPlayerId={socket?.id}
                isRaceFinished={showResults}
              />
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-white/70 text-sm mb-1">Time</div>
                      <div className="text-2xl font-bold text-white">
                        {timeElapsed.toFixed(1)}s
                      </div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm mb-1">WPM</div>
                      <div className="text-2xl font-bold text-white">
                        {roomData?.players?.find(
                          (p) => p.socketId === socket?.id
                        )?.wpm || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm mb-1">Accuracy</div>
                      <div className="text-2xl font-bold text-white">
                        {roomData?.players?.find(
                          (p) => p.socketId === socket?.id
                        )?.accuracy || 100}
                        %
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6">
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70 text-sm">Your Progress</span>
                    <span className="text-white font-bold">
                      {Math.round(getProgressPercentage())}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 h-3 rounded-full transition-all duration-200 ease-out"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-white/70 text-sm mb-2">
                    Type the text below:
                  </p>
                  <div className="bg-gray-900/50 p-6 rounded-lg border border-white/10 min-h-[150px]">
                    <p className="text-lg leading-relaxed font-mono">
                      {(roomData?.text || "").split("").map((char, index) => (
                        <span
                          key={index}
                          className={`${getCharacterClass(index)} ${
                            index === userInput.length
                              ? "border-l-2 border-yellow-400 animate-pulse"
                              : ""
                          }`}
                        >
                          {char}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  disabled={countdown !== null || showResults}
                  placeholder={
                    countdown !== null
                      ? "Wait for countdown..."
                      : "Start typing..."
                  }
                  className="w-full h-32 p-4 bg-gray-900/50 border border-white/10 rounded-lg text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  autoFocus
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function RacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen gradient-dark animate-gradient text-white">
          <Navbar />
          <div className="container mx-auto px-4 py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
          <Footer />
        </div>
      }
    >
      <RacePageContent />
    </Suspense>
  );
}
