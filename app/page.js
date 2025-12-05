"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Gamepad2,
  Keyboard,
  Users,
  Sword,
  ArrowRight,
  Zap,
  Trophy,
  Target,
} from "lucide-react";

export default function HomePage() {
  const games = [
    {
      id: "typer",
      title: "Typer",
      description: "Test and improve your typing speed with various game modes",
      icon: Keyboard,
      color: "from-blue-500 to-cyan-500",
      path: "/typer",
      features: ["Single Player", "Race Mode", "Challenge Friends"],
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Real-time Racing",
      description: "Compete with friends in real-time typing races",
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Monitor your WPM and accuracy improvements",
    },
    {
      icon: Target,
      title: "Challenge Mode",
      description: "Create shareable challenges and compete async",
    },
  ];

  return (
    <div className="min-h-screen gradient-dark animate-gradient text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 sm:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
            <Gamepad2 className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">
              ThitaInfo Games Platform
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Level Up Your
            <span className="text-shimmer"> Typing Skills</span>
          </h1>

          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Fun and interactive games for developers. Challenge yourself,
            compete with friends, and become a typing master!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="btn-cartoon bg-blue-600 hover:bg-blue-700 text-white border-0 text-lg px-8"
            >
              <Link href="/typer">
                <Keyboard className="w-5 h-5 mr-2" />
                Start Typing
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8"
            >
              <Link href="/typer/race">
                <Users className="w-5 h-5 mr-2" />
                Race Friends
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="bg-white/10 border-white/20 backdrop-blur-sm"
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/70">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Games Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Available <span className="text-shimmer">Games</span>
        </h2>

        <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-8 max-w-2xl mx-auto">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Card
                key={game.id}
                className="card-cartoon overflow-hidden hover-lift cursor-pointer bg-white/10 border-white/20 backdrop-blur-sm"
              >
                <CardHeader>
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-r ${game.color} w-fit mb-4`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl  mb-2">{game.title}</CardTitle>
                  <CardDescription className=" text-lg">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {game.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm "
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Button
                    asChild
                    className={`w-full btn-cartoon bg-gradient-to-r ${game.color} text-white border-0 text-lg py-6`}
                  >
                    <Link href={game.path}>
                      Play Now <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Game <span className="text-shimmer">Modes</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover-lift">
            <CardContent className="p-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500 w-fit mb-4">
                <Keyboard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Single Player
              </h3>
              <p className="text-white/70 mb-4">
                Practice solo and improve your typing speed at your own pace.
              </p>
              <Button
                asChild
                className="w-full btn-cartoon bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                <Link href="/typer">Play Solo</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover-lift">
            <CardContent className="p-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 w-fit mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Race Mode</h3>
              <p className="text-white/70 mb-4">
                Create or join a room and race against other players in
                real-time.
              </p>
              <Button
                asChild
                className="w-full btn-cartoon bg-purple-600 hover:bg-purple-700 text-white border-0"
              >
                <Link href="/typer/race">Start Racing</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover-lift">
            <CardContent className="p-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 w-fit mb-4">
                <Sword className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Challenge</h3>
              <p className="text-white/70 mb-4">
                Create a challenge link and share it with friends to compete.
              </p>
              <Button
                asChild
                className="w-full btn-cartoon bg-orange-600 hover:bg-orange-700 text-white border-0"
              >
                <Link href="/typer/challenge">Create Challenge</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
