"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Keyboard, Users, Sword, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function ModeSelector({ onSelectMode }) {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState(null);

  const modes = [
    {
      id: "single",
      title: "Single Player",
      description:
        "Practice your typing skills solo. Improve your speed and accuracy at your own pace.",
      icon: Keyboard,
      color: "from-blue-400 to-cyan-500",
      path: "/typer",
    },
    {
      id: "race",
      title: "Race Mode",
      description:
        "Compete with other players in real-time. Join or create a room and race to the finish!",
      icon: Users,
      color: "from-purple-400 to-pink-500",
      path: "/typer/race",
    },
    {
      id: "challenge",
      title: "Challenge",
      description:
        "Challenge a friend! Create a challenge link and see who types faster.",
      icon: Sword,
      color: "from-orange-400 to-red-500",
      path: "/typer/challenge",
    },
  ];

  const handleSelectMode = (mode) => {
    setSelectedMode(mode.id);
    if (onSelectMode) {
      onSelectMode(mode.id);
    } else {
      router.push(mode.path);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = selectedMode === mode.id;
        return (
          <Card
            key={mode.id}
            className={`card-cartoon overflow-hidden hover-lift cursor-pointer transition-all ${
              isSelected ? "ring-2 ring-blue-500" : ""
            } bg-white/10 border-white/20 backdrop-blur-sm`}
            onClick={() => handleSelectMode(mode)}
          >
            <CardHeader>
              <div
                className={`p-4 rounded-xl bg-gradient-to-r ${mode.color} bg-opacity-20 w-fit mb-4`}
              >
                <Icon className="w-8 h-8 text-gray-600" />
              </div>
              <CardTitle className="text-2xl text-gray-600 mb-2">
                {mode.title}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {mode.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className={`w-full btn-cartoon bg-gradient-to-r ${mode.color} text-white border-0`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectMode(mode);
                }}
              >
                Play <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

