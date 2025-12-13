"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Clock,
  Target,
  AlertCircle,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ModeSelector } from "@/components/typer/ModeSelector";
import { Confetti } from "@/components/typer/Confetti";

// Static array of texts for typing
const TYPING_TEXTS = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
  "Programming is the art of telling a computer what to do through a series of instructions. It requires logic, creativity, and problem-solving skills.",
  "Technology has transformed the way we live, work, and communicate. From smartphones to artificial intelligence, innovation continues to shape our future.",
  "Practice makes perfect. The more you type, the faster and more accurate you become. Consistency is key to improving your typing skills.",
  "Web development combines creativity with technical skills. Building websites requires knowledge of HTML, CSS, JavaScript, and various frameworks.",
  "The best way to learn programming is by doing. Start with simple projects and gradually work your way up to more complex applications.",
  "Clean code is not written by following a set of rules. You don't become a software craftsman by learning a list of heuristics.",
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
  "Innovation distinguishes between a leader and a follower. Think different and challenge the status quo.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
];

export default function TyperPage() {
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [resultData, setResultData] = useState(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize with random text
  useEffect(() => {
    const randomText =
      TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)];
    setText(randomText);
  }, []);

  // Timer effect
  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 0.1);
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
  }, [isStarted, isFinished]);

  // Calculate stats
  useEffect(() => {
    if (isStarted && userInput.length > 0) {
      const timeInMinutes = timeElapsed / 60;
      const wordsTyped = userInput.trim().split(/\s+/).length;
      const calculatedWpm =
        timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0;
      setWpm(calculatedWpm);

      // Calculate accuracy
      let correctChars = 0;
      const minLength = Math.min(userInput.length, text.length);
      for (let i = 0; i < minLength; i++) {
        if (userInput[i] === text[i]) {
          correctChars++;
        }
      }
      const totalChars = userInput.length;
      const calculatedAccuracy =
        totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
      setAccuracy(calculatedAccuracy);

      // Calculate errors
      let errorCount = 0;
      for (let i = 0; i < minLength; i++) {
        if (userInput[i] !== text[i]) {
          errorCount++;
        }
      }
      setErrors(errorCount);
    }
  }, [userInput, timeElapsed, isStarted, text]);

  // Check if finished
  useEffect(() => {
    if (userInput === text && isStarted && !isFinished) {
      setIsFinished(true);
      setShowResults(true);
      calculateFinalResults();
    }
  }, [userInput, text, isStarted, isFinished]);

  const calculateFinalResults = async () => {
    const timeInMinutes = timeElapsed / 60;
    const wordsTyped = text.trim().split(/\s+/).length;
    const finalWpm =
      timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0;

    const result = {
      wpm: finalWpm,
      accuracy: accuracy,
      time: parseFloat(timeElapsed.toFixed(1)),
      errors: errors,
      date: new Date().toISOString(),
    };

    setResultData(result);

    // Save to MongoDB
    try {
      await fetch("/api/typer/save-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      });
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (!isStarted && value.length > 0) {
      setIsStarted(true);
    }
    setUserInput(value);
  };

  // Prevent paste to avoid cheating
  const handlePaste = (e) => {
    e.preventDefault();
    alert("Pasting is not allowed! Type the text yourself.");
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (text.length === 0) return 0;
    return Math.min((userInput.length / text.length) * 100, 100);
  };

  const handleRestart = () => {
    const randomText =
      TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)];
    setText(randomText);
    setUserInput("");
    setIsStarted(false);
    setIsFinished(false);
    setTimeElapsed(0);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setShowResults(false);
    setResultData(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getCharacterClass = (index) => {
    if (index >= userInput.length) return "text-gray-400";
    if (userInput[index] === text[index]) return "text-green-400";
    return "text-red-400 bg-red-400/20";
  };

  return (
    <div className="min-h-screen gradient-dark animate-gradient text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-white">
            Typer
          </h1>
          <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8">
            Test your typing speed and accuracy
          </p>
        </div>

        {/* Mode Selector */}
        <ModeSelector />

        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">
            Single Player Mode
          </h2>
        </div>

        {/* Stats Panel */}
        {isStarted && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Card className="bg-white/15 border-white/30 backdrop-blur-md shadow-lg">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  <span className="text-white/90 text-xs sm:text-sm font-medium">
                    Time
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {timeElapsed.toFixed(1)}s
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/15 border-white/30 backdrop-blur-md shadow-lg">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span className="text-white/90 text-xs sm:text-sm font-medium">
                    WPM
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {wpm}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/15 border-white/30 backdrop-blur-md shadow-lg">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                  <span className="text-white/90 text-xs sm:text-sm font-medium">
                    Accuracy
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {accuracy}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/15 border-white/30 backdrop-blur-md shadow-lg">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                  <span className="text-white/90 text-xs sm:text-sm font-medium">
                    Errors
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {errors}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Bar */}
        {isStarted && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm font-medium">Progress</span>
              <span className="text-white font-bold">{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 h-3 rounded-full transition-all duration-200 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}

        {/* Typing Area */}
        <Card className="bg-white/15 border-white/30 backdrop-blur-md shadow-lg mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4">
              <p className="text-white/90 text-sm sm:text-base mb-2 font-medium">
                Type the text below:
              </p>
              <div className="bg-gray-900/70 p-4 sm:p-6 rounded-lg border border-white/20 min-h-[120px] sm:min-h-[150px]">
                <p className="text-base sm:text-lg leading-relaxed font-mono">
                  {text.split("").map((char, index) => (
                    <span 
                      key={index} 
                      className={`${getCharacterClass(index)} ${index === userInput.length ? 'border-l-2 border-yellow-400 animate-pulse' : ''}`}
                    >
                      {char}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <div>
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                  }
                }}
                disabled={isFinished}
                placeholder={isStarted ? "" : "Start typing to begin..."}
                className="w-full h-28 sm:h-32 p-3 sm:p-4 bg-gray-900/70 border border-white/20 rounded-lg text-white font-mono text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                autoFocus
              />
            </div>

            <div className="flex gap-4 mt-4">
              <Button
                onClick={handleRestart}
                className="btn-cartoon bg-blue-600 hover:bg-blue-700 text-white border-0 text-sm sm:text-base px-4 sm:px-6"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Modal */}
        {showResults && resultData && (
          <>
          <Confetti active={showResults} />
          <Card className="bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-white/40 backdrop-blur-md shadow-xl">
            <CardContent className="p-6 sm:p-8 text-center">
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">
                Test Complete!
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div>
                  <p className="text-white/90 text-xs sm:text-sm mb-1 font-medium">
                    WPM
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {resultData.wpm}
                  </p>
                </div>
                <div>
                  <p className="text-white/90 text-xs sm:text-sm mb-1 font-medium">
                    Accuracy
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {resultData.accuracy}%
                  </p>
                </div>
                <div>
                  <p className="text-white/90 text-xs sm:text-sm mb-1 font-medium">
                    Time
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {resultData.time}s
                  </p>
                </div>
                <div>
                  <p className="text-white/90 text-xs sm:text-sm mb-1 font-medium">
                    Errors
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {resultData.errors}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRestart}
                className="btn-cartoon bg-blue-600 hover:bg-blue-700 text-white border-0 text-sm sm:text-base px-6 sm:px-8"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

