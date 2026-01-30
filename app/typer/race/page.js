"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  Play,
  Loader2,
  Trophy,
  Clock,
  AlertCircle,
  Timer,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useSocket } from "@/lib/socket/client";
import { RoomLobby } from "@/components/typer/RoomLobby";
import { LiveLeaderboard } from "@/components/typer/LiveLeaderboard";
import { RaceCountdown } from "@/components/typer/RaceCountdown";
import { Confetti } from "@/components/typer/Confetti";
import { RaceTrack } from "@/components/typer/RaceTrack";

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
  const [timerMode, setTimerMode] = useState("text-based"); // Timer mode selection
  const [timerDuration, setTimerDuration] = useState(120); // Fixed timer duration
  const [raceDuration, setRaceDuration] = useState(120); // Actual race duration from server
  const [graceCountdown, setGraceCountdown] = useState(null); // Grace period countdown
  const [firstFinisher, setFirstFinisher] = useState(null); // First finisher info
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const graceIntervalRef = useRef(null);
  const hasFinishedRef = useRef(false); // Track if player has already finished
  const timeElapsedRef = useRef(0); // Track current time to avoid stale closures
  const userInputRef = useRef(""); // Track current input to avoid stale closures
  const roomDataRef = useRef(null); // Track current room data to avoid stale closures

  // Check if joining via room code from URL (including challenge mode)
  useEffect(() => {
    const code = searchParams.get("code");
    const urlUsername = searchParams.get("username");
    const isChallenge = searchParams.get("challenge") === "true";

    if (code) {
      setRoomCodeInput(code);
    }
    if (urlUsername) {
      setUsername(decodeURIComponent(urlUsername));
    }

    // Auto-join if coming from challenge with username
    if (code && urlUsername && isChallenge && socket && isConnected && !roomId && !autoJoined) {
      const decodedUsername = decodeURIComponent(urlUsername);
      setAutoJoined(true);

      // Join the challenge room directly
      fetch("/api/typer/join-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setRoomId(code);
            socket.emit("join-room", { roomId: code, username: decodedUsername });
          } else {
            alert(data.message || "Error joining challenge room");
            setAutoJoined(false);
          }
        })
        .catch((error) => {
          console.error("Error joining challenge room:", error);
          alert("Error joining challenge room");
          setAutoJoined(false);
        });
    }
  }, [searchParams, socket, isConnected, roomId, autoJoined]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("room-update", (data) => {
      setRoomData(data);
      roomDataRef.current = data; // Keep ref in sync
      if (data.hostId === socket.id) {
        setIsHost(true);
      }

      // Fallback: If race is finished but results aren't showing, trigger results display
      // This handles cases where race-finished event was missed
      if (data.status === "finished" && !showResults && raceStarted) {
        setShowResults(true);
        setRaceStarted(false);

        // Clear timers
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        // Sort players for results
        const sortedPlayers = [...(data.players || [])].sort((a, b) => {
          if (a.finished && !b.finished) return -1;
          if (!a.finished && b.finished) return 1;
          if (a.finished && b.finished) {
            const timeA = a.time || Infinity;
            const timeB = b.time || Infinity;
            if (timeA !== timeB) return timeA - timeB;
            return (b.wpm || 0) - (a.wpm || 0);
          }
          if ((b.progress || 0) !== (a.progress || 0)) {
            return (b.progress || 0) - (a.progress || 0);
          }
          return (b.wpm || 0) - (a.wpm || 0);
        });

        // Find winner (first finished player)
        const winner = sortedPlayers.find((p) => p.finished);

        setRaceResults({
          players: sortedPlayers,
          winner: winner
            ? {
                socketId: winner.socketId,
                username: winner.username,
                wpm: winner.wpm,
                accuracy: winner.accuracy,
                errors: winner.errors,
                time: winner.time,
              }
            : null,
        });
      } else if (data.status === "finished" && showResults) {
        // Keep updating race results if race is finished (to get latest player stats)
        setRaceResults((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: data.players, // Update with latest player data
          };
        });
      }
    });

    socket.on("race-countdown", (data) => {
      setCountdown(data.countdown);
    });

    socket.on("race-started", (data) => {
      setCountdown(null);
      setRaceStarted(true);
      setTimeElapsed(0);
      setUserInput("");
      // Reset all refs when race starts
      timeElapsedRef.current = 0;
      userInputRef.current = "";
      hasFinishedRef.current = false;
      if (data?.raceDuration) {
        setRaceDuration(data.raceDuration);
      }
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });

    socket.on("first-player-finished", (data) => {
      setFirstFinisher({
        name: data.finisherName,
        socketId: data.finisherId,
        gracePeriodSeconds: data.gracePeriodSeconds,
      });
      setGraceCountdown(data.gracePeriodSeconds);

      // Clear any existing grace interval
      if (graceIntervalRef.current) {
        clearInterval(graceIntervalRef.current);
      }

      // Start grace countdown
      graceIntervalRef.current = setInterval(() => {
        setGraceCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(graceIntervalRef.current);
            graceIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on("race-finished", (data) => {
      // Race ended - show results to all players
      setShowResults(true);
      setRaceStarted(false); // Stop the race
      setGraceCountdown(null); // Clear grace countdown
      setFirstFinisher(null); // Clear first finisher

      // Clear all timers immediately
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (graceIntervalRef.current) {
        clearInterval(graceIntervalRef.current);
        graceIntervalRef.current = null;
      }

      if (data.results) {
        // Sort players: finished first (by time), then unfinished (by progress/wpm)
        const sortedPlayers = [...data.results].sort((a, b) => {
          // Finished players come first
          if (a.finished && !b.finished) return -1;
          if (!a.finished && b.finished) return 1;

          // Both finished - sort by time (lower is better)
          if (a.finished && b.finished) {
            const timeA = a.time || Infinity;
            const timeB = b.time || Infinity;
            if (timeA !== timeB) return timeA - timeB;
            // If same time, sort by WPM
            return (b.wpm || 0) - (a.wpm || 0);
          }

          // Both not finished - sort by progress, then WPM
          if ((b.progress || 0) !== (a.progress || 0)) {
            return (b.progress || 0) - (a.progress || 0);
          }
          return (b.wpm || 0) - (a.wpm || 0);
        });

        setRaceResults({
          players: sortedPlayers,
          winner: data.winner, // Winner is the first person to finish (from server)
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
      socket.off("first-player-finished");
      socket.off("error");
      socket.off("disconnect");
      socket.off("connect");
      if (graceIntervalRef.current) {
        clearInterval(graceIntervalRef.current);
      }
    };
  }, [socket, roomId, username, showResults, raceStarted]);

  // Timer for race with dynamic timeout
  useEffect(() => {
    if (raceStarted && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 0.1;
          timeElapsedRef.current = newTime; // Keep ref in sync
          // Race timeout based on configured duration
          if (newTime >= raceDuration) {
            handleRaceFinish();
            return raceDuration;
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
  }, [raceStarted, showResults, raceDuration]);

  // Progress tracking - uses refs to avoid stale closures
  useEffect(() => {
    if (raceStarted && socket && roomId) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        // Use refs to get current values (avoids stale closures)
        const currentInput = userInputRef.current;
        const currentRoomData = roomDataRef.current;
        const text = currentRoomData?.text || "";

        // Skip if no input yet
        if (!currentInput || currentInput.length === 0) return;

        const progress =
          text.length > 0 ? (currentInput.length / text.length) * 100 : 0;
        const currentTime = timeElapsedRef.current;
        const timeInMinutes = currentTime / 60;

        // Standard WPM calculation: (characters / 5) / minutes
        const wpm =
          timeInMinutes > 0
            ? Math.round(currentInput.length / 5 / timeInMinutes)
            : 0;

        let correctChars = 0;
        const minLength = Math.min(currentInput.length, text.length);
        for (let i = 0; i < minLength; i++) {
          if (currentInput[i] === text[i]) {
            correctChars++;
          }
        }
        const accuracy =
          currentInput.length > 0
            ? Math.round((correctChars / currentInput.length) * 100)
            : 100;

        let errors = 0;
        for (let i = 0; i < minLength; i++) {
          if (currentInput[i] !== text[i]) {
            errors++;
          }
        }

        const finished = currentInput === text && text.length > 0;

        socket.emit("player-progress", {
          roomId,
          progress,
          wpm,
          accuracy,
          errors,
          finished,
        });

        // If finished typing, call handleRaceFinish
        if (finished && !hasFinishedRef.current) {
          handleRaceFinish();
        }
      }, 500);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [raceStarted, socket, roomId]); // Removed timeElapsed, userInput, roomData, showResults - using refs instead

  const handleCreateRoom = async () => {
    if (!socket || !username.trim()) {
      alert("Please enter a username");
      return;
    }

    try {
      const response = await fetch("/api/typer/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId: socket.id,
          maxPlayers: maxPlayersInput,
          timerMode,
          timerDuration: timerMode === "fixed" ? timerDuration : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const newRoomId = data.data.roomId;
        setRoomId(newRoomId);
        setRoomCodeInput(newRoomId);
        setIsHost(true);
        setAutoJoined(true);
        // Set race duration from server response
        if (data.data.calculatedDuration) {
          setRaceDuration(data.data.calculatedDuration);
        }
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
    // Prevent multiple finish calls
    if (hasFinishedRef.current) {
      return;
    }
    hasFinishedRef.current = true;

    // Use refs to get current values (avoids stale closures)
    const currentInput = userInputRef.current;
    const currentRoomData = roomDataRef.current;
    const text = currentRoomData?.text || "";
    const currentTime = timeElapsedRef.current;
    const timeInMinutes = currentTime / 60;

    // Standard WPM calculation: (characters / 5) / minutes
    // Use the text length since player has finished typing the complete text
    const finalWpm =
      timeInMinutes > 0 ? Math.round(text.length / 5 / timeInMinutes) : 0;

    let correctChars = 0;
    const minLength = Math.min(currentInput.length, text.length);
    for (let i = 0; i < minLength; i++) {
      if (currentInput[i] === text[i]) {
        correctChars++;
      }
    }
    const accuracy =
      currentInput.length > 0
        ? Math.round((correctChars / currentInput.length) * 100)
        : 100;

    let errors = 0;
    for (let i = 0; i < minLength; i++) {
      if (currentInput[i] !== text[i]) {
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
        time: currentTime,
      });
    }
  };

  const handleInputChange = (e) => {
    if (!raceStarted || countdown !== null) return;
    const value = e.target.value;
    setUserInput(value);
    userInputRef.current = value; // Keep ref in sync
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
    if (index >= userInput.length) return "typing-char-pending";
    if (userInput[index] === (roomData?.text || "")[index])
      return "typing-char-correct";
    return "typing-char-incorrect";
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen gradient-cyber text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Connecting to server...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading when auto-joining from challenge
  if (autoJoined && (!roomId || !roomData)) {
    return (
      <div className="min-h-screen gradient-cyber text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Joining challenge room...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!roomId || !roomData) {
    return (
      <div className="min-h-screen gradient-cyber text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <Link
            href="/typer"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Typer
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-gaming text-center">
            <span className="text-shimmer">RACE MODE</span>
          </h1>
          <p className="text-center text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Compete with other players in real-time. Join or create a room and race to the finish!
          </p>

          <div className="max-w-5xl mx-auto">
            {/* Player Setup - Horizontal */}
            <div className="cyber-card p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-bold text-neon-cyan font-gaming text-glow-cyan">
                  PLAYER SETUP
                </h2>
                <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1 md:max-w-md">
                  <label className="text-white text-sm uppercase tracking-wider whitespace-nowrap font-medium">
                    Username:
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-cyber-dark border-cyber-border text-white focus:border-neon-cyan focus:ring-neon-cyan/50 flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Create & Join Room - Side by Side */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Create Room Section */}
              <div className="cyber-card p-6 neon-border-cyan bg-neon-cyan/5">
                <h3 className="text-lg font-semibold mb-4 text-neon-cyan font-gaming flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  CREATE NEW ROOM
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block uppercase tracking-wider font-medium">
                      Max Players
                    </label>
                    <Input
                      type="number"
                      value={maxPlayersInput}
                      onChange={(e) =>
                        setMaxPlayersInput(
                          Math.max(
                            2,
                            Math.min(50, parseInt(e.target.value) || 2),
                          ),
                        )
                      }
                      placeholder="Max players (2-50)"
                      min={2}
                      max={50}
                      className="bg-cyber-dark border-cyber-border text-white"
                    />
                    <p className="text-white/60 text-xs mt-1">
                      2-50 players allowed
                    </p>
                  </div>

                  <div>
                    <label className="text-white text-sm mb-2 block uppercase tracking-wider font-medium">
                      Race Timer
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        onClick={() => setTimerMode("text-based")}
                        className={`${timerMode === "text-based" ? "bg-neon-cyan text-cyber-dark" : "bg-cyber-dark border-cyber-border text-white hover:border-neon-cyan/50"}`}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Auto
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setTimerMode("fixed")}
                        className={`${timerMode === "fixed" ? "bg-neon-cyan text-cyber-dark" : "bg-cyber-dark border-cyber-border text-white hover:border-neon-cyan/50"}`}
                      >
                        <Timer className="w-4 h-4 mr-1" />
                        Fixed
                      </Button>
                    </div>
                    {timerMode === "fixed" && (
                      <div className="grid grid-cols-5 gap-1 mt-2">
                        {[30, 60, 90, 120, 180].map((seconds) => (
                          <Button
                            key={seconds}
                            type="button"
                            size="sm"
                            onClick={() => setTimerDuration(seconds)}
                            className={`${timerDuration === seconds ? "bg-neon-green text-cyber-dark" : "bg-cyber-dark border-cyber-border text-white/70 hover:text-white"} text-xs`}
                          >
                            {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                          </Button>
                        ))}
                      </div>
                    )}
                    <p className="text-white/60 text-xs mt-1">
                      {timerMode === "text-based"
                        ? "Based on text (~40 WPM)"
                        : `${timerDuration}s limit`}
                    </p>
                  </div>

                  <Button
                    onClick={handleCreateRoom}
                    disabled={!username.trim()}
                    className="w-full btn-neon-filled mt-2"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    CREATE ROOM
                  </Button>
                </div>
              </div>

              {/* Join Room Section */}
              <div className="cyber-card p-6 neon-border-green bg-neon-green/5">
                <h3 className="text-lg font-semibold mb-4 text-neon-green font-gaming flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  JOIN EXISTING ROOM
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block uppercase tracking-wider font-medium">
                      Room Code
                    </label>
                    <Input
                      value={roomCodeInput}
                      onChange={(e) =>
                        setRoomCodeInput(e.target.value.toUpperCase())
                      }
                      placeholder="Enter 6-digit code"
                      className="bg-cyber-dark border-cyber-border text-white text-center text-2xl font-gaming tracking-widest"
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
                    <p className="text-white/60 text-xs mt-1">
                      Get code from room host
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleJoinRoom}
                      disabled={!username.trim() || !roomCodeInput.trim()}
                      className="w-full bg-neon-green hover:bg-neon-green/80 text-cyber-dark font-bold rounded-lg transition-all hover:shadow-neon-green py-3"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      JOIN ROOM
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (showResults && raceResults) {
    const isWinner = raceResults.winner?.socketId === socket?.id;

    // Sort players for display: finished first (by time), then unfinished (by progress/wpm)
    const sortedResultPlayers = [...(raceResults.players || [])].sort(
      (a, b) => {
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

        // Both not finished - sort by progress, then WPM
        const progressA = a.progress || 0;
        const progressB = b.progress || 0;
        if (progressB !== progressA) return progressB - progressA;
        return (b.wpm || 0) - (a.wpm || 0);
      },
    );

    return (
      <div className="min-h-screen gradient-cyber text-white">
        <Confetti active={isWinner} />
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="cyber-card max-w-4xl mx-auto p-8">
            {/* Winner Announcement */}
            <div className="text-center mb-8">
              <div className="animate-winner-reveal">
                <Trophy className="w-24 h-24 text-neon-cyan mx-auto mb-4 drop-shadow-[0_0_30px_#00f0ff]" />
              </div>
              <h2 className="text-5xl font-bold mb-2 font-gaming text-shimmer">
                RACE COMPLETE!
              </h2>
              {raceResults.winner && (
                <div className="mt-6 animate-fade-in">
                  <p className="text-white/50 text-sm uppercase tracking-widest mb-2">
                    Champion
                  </p>
                  <p className="text-4xl font-bold font-gaming text-glow-cyan text-neon-cyan">
                    👑 {raceResults.winner.username} 👑
                  </p>
                  <div className="mt-4 flex justify-center gap-6 text-lg">
                    <span className="text-neon-cyan font-gaming">
                      {raceResults.winner.wpm || 0} WPM
                    </span>
                    <span className="text-neon-green">
                      {raceResults.winner.accuracy !== undefined
                        ? raceResults.winner.accuracy
                        : 100}
                      %
                    </span>
                    {typeof raceResults.winner.time === "number" && (
                      <span className="text-neon-orange">
                        {raceResults.winner.time.toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>
              )}
              {isWinner && (
                <div className="mt-6 p-4 rounded-lg neon-border-cyan bg-neon-cyan/10 animate-pulse-glow">
                  <p className="text-2xl font-bold text-neon-cyan font-gaming text-glow-cyan">
                    🎉 YOU ARE THE CHAMPION! 🎉
                  </p>
                </div>
              )}
            </div>

            {/* Podium Display for Top 3 */}
            {sortedResultPlayers.length >= 2 && (
              <div className="podium-container mb-8">
                {/* 2nd Place */}
                {sortedResultPlayers[1] && (
                  <div
                    className="podium-place animate-podium-rise"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <div className="text-center mb-2">
                      <span className="text-white font-bold">
                        {sortedResultPlayers[1].username}
                      </span>
                      <div className="text-neon-cyan font-gaming text-xl">
                        {sortedResultPlayers[1].wpm || 0}
                      </div>
                      <div className="text-xs text-white/50">WPM</div>
                    </div>
                    <div className="podium-stand podium-2nd">
                      <span className="text-3xl">🥈</span>
                      <span className="text-cyber-dark font-bold text-xl mt-2">
                        2nd
                      </span>
                    </div>
                  </div>
                )}
                {/* 1st Place */}
                {sortedResultPlayers[0] && (
                  <div
                    className="podium-place animate-podium-rise"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <div className="text-center mb-2">
                      <span className="text-white font-bold text-lg">
                        {sortedResultPlayers[0].username}
                      </span>
                      <div className="text-neon-cyan font-gaming text-2xl text-glow-cyan">
                        {sortedResultPlayers[0].wpm || 0}
                      </div>
                      <div className="text-xs text-white/50">WPM</div>
                    </div>
                    <div className="podium-stand podium-1st">
                      <span className="text-4xl">👑</span>
                      <span className="text-cyber-dark font-bold text-2xl mt-2">
                        1st
                      </span>
                    </div>
                  </div>
                )}
                {/* 3rd Place */}
                {sortedResultPlayers[2] && (
                  <div
                    className="podium-place animate-podium-rise"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <div className="text-center mb-2">
                      <span className="text-white font-bold">
                        {sortedResultPlayers[2].username}
                      </span>
                      <div className="text-neon-cyan font-gaming text-xl">
                        {sortedResultPlayers[2].wpm || 0}
                      </div>
                      <div className="text-xs text-white/50">WPM</div>
                    </div>
                    <div className="podium-stand podium-3rd">
                      <span className="text-3xl">🥉</span>
                      <span className="text-cyber-dark font-bold text-xl mt-2">
                        3rd
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Full Results */}
            <h3 className="text-xl font-bold mb-4 text-neon-cyan font-gaming text-glow-cyan">
              FINAL STANDINGS
            </h3>
            <div className="space-y-3">
              {sortedResultPlayers.map((player, index) => (
                <div
                  key={player.socketId || index}
                  className={`p-4 rounded-lg transition-all animate-slide-up cyber-card ${
                    index === 0
                      ? "rank-gold"
                      : index === 1
                        ? "rank-silver"
                        : index === 2
                          ? "rank-bronze"
                          : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-3xl font-bold ${index < 3 ? "text-cyber-dark" : "text-white/50"}`}
                      >
                        {index === 0
                          ? "👑"
                          : index === 1
                            ? "🥈"
                            : index === 2
                              ? "🥉"
                              : `#${index + 1}`}
                      </span>
                      <div>
                        <span
                          className={`font-bold text-lg ${index < 3 ? "text-cyber-dark" : "text-white"}`}
                        >
                          {player.username}
                        </span>
                        <div className="flex gap-2 mt-1">
                          {player.socketId === socket?.id && (
                            <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                              YOU
                            </Badge>
                          )}
                          {player.finished ? (
                            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                              ✓ FINISHED
                            </Badge>
                          ) : (
                            <Badge className="bg-neon-magenta/20 text-neon-magenta border-neon-magenta/30">
                              DNF
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-3xl font-bold font-gaming ${index < 3 ? "text-cyber-dark" : "text-neon-cyan text-glow-cyan"}`}
                      >
                        {player.wpm || 0}
                        <span className="text-sm ml-1">WPM</span>
                      </div>
                      <div
                        className={`text-sm ${index < 3 ? "text-cyber-dark/70" : "text-white/70"}`}
                      >
                        {player.accuracy !== undefined ? player.accuracy : 100}%
                        • {player.errors || 0} errors
                      </div>
                      {player.finished && typeof player.time === "number" ? (
                        <div
                          className={`text-sm font-medium ${index < 3 ? "text-cyber-dark" : "text-neon-green"}`}
                        >
                          ⏱️ {player.time.toFixed(1)}s
                        </div>
                      ) : !player.finished ? (
                        <div className="text-sm text-neon-magenta font-medium">
                          Progress: {Math.round(player.progress || 0)}%
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
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
                  timeElapsedRef.current = 0;
                  userInputRef.current = "";
                  roomDataRef.current = null;
                  hasFinishedRef.current = false;
                  setAutoJoined(false);
                  setIsHost(false);
                  setCountdown(null);
                  setGraceCountdown(null);
                  setFirstFinisher(null);
                  setRaceDuration(120);
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                  }
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                  }
                  if (graceIntervalRef.current) {
                    clearInterval(graceIntervalRef.current);
                    graceIntervalRef.current = null;
                  }
                }}
                className="flex-1 btn-neon-filled"
              >
                <Play className="w-4 h-4 mr-2" />
                NEW RACE
              </Button>
              <Button
                onClick={() => router.push("/typer")}
                className="flex-1 btn-neon"
              >
                BACK TO TYPER
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-cyber text-white">
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
            {/* Race Track Visualization */}
            <RaceTrack
              players={roomData?.players || []}
              currentPlayerId={socket?.id}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <LiveLeaderboard
                players={roomData?.players || []}
                currentPlayerId={socket?.id}
                isRaceFinished={showResults}
              />
              {/* Stats Panel */}
              <div className="cyber-card p-6">
                <h3 className="text-lg font-bold mb-4 text-neon-cyan font-gaming text-glow-cyan">
                  YOUR STATS
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="stat-card">
                    <div
                      className="stat-value text-neon-orange"
                      style={{ textShadow: "0 0 20px #ff6b0060" }}
                    >
                      {timeElapsed.toFixed(1)}
                    </div>
                    <div className="stat-label">TIME</div>
                    <div className="text-xs text-white/30 mt-1">
                      / {raceDuration}s
                    </div>
                    {/* Time progress bar */}
                    <div className="progress-neon mt-2">
                      <div
                        className="progress-neon-fill"
                        style={{
                          width: `${Math.min((timeElapsed / raceDuration) * 100, 100)}%`,
                          background:
                            timeElapsed / raceDuration > 0.8
                              ? "#ff00aa"
                              : timeElapsed / raceDuration > 0.5
                                ? "#ff6b00"
                                : "#00ff88",
                        }}
                      />
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {roomData?.players?.find((p) => p.socketId === socket?.id)
                        ?.wpm || 0}
                    </div>
                    <div className="stat-label">WPM</div>
                  </div>
                  <div className="stat-card">
                    <div
                      className="stat-value text-neon-green"
                      style={{ textShadow: "0 0 20px #00ff8860" }}
                    >
                      {roomData?.players?.find((p) => p.socketId === socket?.id)
                        ?.accuracy || 100}
                      %
                    </div>
                    <div className="stat-label">ACCURACY</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grace Period Warning Banner */}
            {graceCountdown !== null &&
              graceCountdown > 0 &&
              firstFinisher &&
              firstFinisher.socketId !== socket?.id && (
                <div
                  className="cyber-card neon-border-magenta bg-neon-magenta/10 p-4 animate-pulse-glow"
                  style={{ "--glow-color": "#ff00aa" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-neon-magenta" />
                      <span className="text-neon-magenta font-medium font-gaming">
                        {firstFinisher.name} FINISHED! Race ends in:
                      </span>
                    </div>
                    <span className="text-3xl font-bold text-neon-magenta font-gaming text-glow-magenta">
                      {graceCountdown}s
                    </span>
                  </div>
                  <div className="progress-neon mt-3">
                    <div
                      className="progress-neon-fill"
                      style={{
                        width: `${(graceCountdown / 15) * 100}%`,
                        background: "#ff00aa",
                      }}
                    />
                  </div>
                </div>
              )}

            {/* Typing Area */}
            <div className="cyber-card p-6">
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/50 text-sm uppercase tracking-wider">
                    Your Progress
                  </span>
                  <span className="text-neon-cyan font-bold font-gaming text-glow-cyan">
                    {Math.round(getProgressPercentage())}%
                  </span>
                </div>
                <div className="progress-neon h-3">
                  <div
                    className="progress-neon-fill h-full"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <p className="text-white/50 text-sm mb-2 uppercase tracking-wider">
                  Type the text below:
                </p>
                <div className="bg-cyber-darker p-6 rounded-lg border border-cyber-border min-h-[150px]">
                  <p className="text-lg leading-relaxed font-mono">
                    {(roomData?.text || "").split("").map((char, index) => (
                      <span
                        key={index}
                        className={`${getCharacterClass(index)} ${
                          index === userInput.length
                            ? "typing-char-current"
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
                className="w-full h-32 p-4 bg-cyber-darker border border-cyber-border rounded-lg text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan resize-none placeholder-white/30"
                autoFocus
              />
            </div>
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
        <div className="min-h-screen gradient-cyber text-white">
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
