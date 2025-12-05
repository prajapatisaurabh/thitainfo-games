"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sword, Loader2, Play } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { useSocket } from "@/lib/socket/client";

export default function ChallengeAcceptPage() {
  const router = useRouter();
  const params = useParams();
  const { socket, isConnected } = useSocket();
  const [username, setUsername] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = params?.challengeId;
    if (id) {
      setChallengeId(id);
      loadChallenge(id);
    }
  }, [params]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("challenge-accepted", (data) => {
      // Redirect to race page with the challenge room
      router.push(
        `/typer/race?code=${data.roomId.replace("challenge_", "")}`
      );
    });

    socket.on("error", (error) => {
      alert(error.message || "An error occurred");
      setLoading(false);
    });

    return () => {
      socket.off("challenge-accepted");
      socket.off("error");
    };
  }, [socket, router]);

  const loadChallenge = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/typer/challenge/${id}`);
      const data = await response.json();
      if (data.success) {
        setChallengeData(data.data);
      } else {
        alert(data.message || "Challenge not found");
      }
    } catch (error) {
      console.error("Error loading challenge:", error);
      alert("Error loading challenge");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async () => {
    if (!socket || !username.trim() || !challengeId) {
      alert("Please enter a username");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/typer/accept-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      });

      const data = await response.json();
      if (data.success) {
        // Accept challenge via socket
        socket.emit("accept-challenge", { challengeId, username });
      } else {
        alert(data.message || "Error accepting challenge");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error accepting challenge:", error);
      alert("Error accepting challenge");
      setLoading(false);
    }
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

  if (loading && !challengeData) {
    return (
      <div className="min-h-screen gradient-dark animate-gradient text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading challenge...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!challengeData) {
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
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-white">Challenge not found or has expired.</p>
              <Button
                onClick={() => router.push("/typer/challenge")}
                className="mt-4 btn-cartoon bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                Create New Challenge
              </Button>
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
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          Accept Challenge
        </h1>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sword className="w-8 h-8 text-orange-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Challenge from {challengeData.challengerName}
                  </h2>
                  <p className="text-white/70">
                    Can you beat their typing speed?
                  </p>
                </div>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-white/10 mb-4">
                <p className="text-white/70 text-sm mb-2">Text to type:</p>
                <p className="text-white font-mono">{challengeData.text}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-white">
                Enter your username
              </h3>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="bg-gray-900/50 border-white/10 text-white mb-4"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && username.trim()) {
                    handleAcceptChallenge();
                  }
                }}
              />
              <Button
                onClick={handleAcceptChallenge}
                disabled={!username.trim() || loading}
                className="w-full btn-cartoon bg-orange-600 hover:bg-orange-700 text-white border-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Accept Challenge
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}

