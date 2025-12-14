"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FileCode,
  Database,
  Wifi,
  Server,
  Globe,
  ArrowLeft,
  Copy,
  Check,
  Zap,
  Users,
  Trophy,
  Code,
  BookOpen,
  Layers,
  GitBranch,
} from "lucide-react";

// Collapsible Section Component
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden mb-4 bg-gray-900/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-white text-lg">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-white/50" />
        ) : (
          <ChevronRight className="w-5 h-5 text-white/50" />
        )}
      </button>
      {isOpen && <div className="px-6 pb-6 border-t border-white/10 pt-4">{children}</div>}
    </div>
  );
}

// Code Block Component with Copy
function CodeBlock({ code, language = "javascript", title }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      {title && (
        <div className="bg-gray-800 px-4 py-2 rounded-t-lg border border-white/10 border-b-0">
          <span className="text-sm text-white/70">{title}</span>
        </div>
      )}
      <div className={`relative ${title ? "rounded-t-none" : ""}`}>
        <pre className={`bg-gray-950 p-4 rounded-lg ${title ? "rounded-t-none" : ""} border border-white/10 overflow-x-auto`}>
          <code className="text-sm text-green-400 font-mono whitespace-pre">{code}</code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-2 bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-white/70" />
          )}
        </button>
      </div>
    </div>
  );
}

// API Endpoint Component
function ApiEndpoint({ method, path, description, requestBody, responseBody, statusCodes }) {
  const methodColors = {
    GET: "bg-green-500/20 text-green-400 border-green-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PUT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="border border-white/10 rounded-lg p-4 mb-4 bg-gray-900/50">
      <div className="flex items-center gap-3 mb-3">
        <Badge className={`${methodColors[method]} font-mono font-bold`}>{method}</Badge>
        <code className="text-cyan-400 font-mono text-sm">{path}</code>
      </div>
      <p className="text-white/70 mb-4">{description}</p>
      
      {requestBody && (
        <div className="mb-4">
          <h5 className="text-sm font-semibold text-white/90 mb-2">Request Body:</h5>
          <CodeBlock code={JSON.stringify(requestBody, null, 2)} language="json" />
        </div>
      )}
      
      {responseBody && (
        <div className="mb-4">
          <h5 className="text-sm font-semibold text-white/90 mb-2">Response:</h5>
          <CodeBlock code={JSON.stringify(responseBody, null, 2)} language="json" />
        </div>
      )}
      
      {statusCodes && (
        <div>
          <h5 className="text-sm font-semibold text-white/90 mb-2">Status Codes:</h5>
          <div className="flex flex-wrap gap-2">
            {statusCodes.map((status) => (
              <Badge
                key={status.code}
                className={`${
                  status.code < 300
                    ? "bg-green-500/20 text-green-400"
                    : status.code < 500
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {status.code}: {status.meaning}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// WebSocket Event Component
function SocketEvent({ name, direction, description, payload }) {
  return (
    <div className="border border-white/10 rounded-lg p-4 mb-4 bg-gray-900/50">
      <div className="flex items-center gap-3 mb-3">
        <Badge
          className={`${
            direction === "emit"
              ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
              : "bg-purple-500/20 text-purple-400 border-purple-500/30"
          }`}
        >
          {direction === "emit" ? "→ EMIT" : "← ON"}
        </Badge>
        <code className="text-cyan-400 font-mono font-bold">{name}</code>
      </div>
      <p className="text-white/70 mb-3">{description}</p>
      {payload && (
        <div>
          <h5 className="text-sm font-semibold text-white/90 mb-2">Payload:</h5>
          <CodeBlock code={JSON.stringify(payload, null, 2)} language="json" />
        </div>
      )}
    </div>
  );
}

// Table of Contents Item
function TocItem({ href, children, indent = 0 }) {
  return (
    <a
      href={href}
      className={`block py-1 text-white/60 hover:text-cyan-400 transition-colors ${
        indent > 0 ? `pl-${indent * 4}` : ""
      }`}
      style={{ paddingLeft: indent * 16 }}
    >
      {children}
    </a>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen gradient-dark animate-gradient text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="w-12 h-12 text-cyan-400" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Documentation</h1>
              <p className="text-white/70 mt-2">
                Complete guide to ThitaInfo Games - Typing Race Application
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gray-900/50 border border-white/10 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Table of Contents
              </h3>
              <nav className="space-y-1 text-sm">
                <TocItem href="#overview">Overview</TocItem>
                <TocItem href="#tech-stack">Tech Stack</TocItem>
                <TocItem href="#project-structure">Project Structure</TocItem>
                <TocItem href="#getting-started">Getting Started</TocItem>
                <TocItem href="#environment">Environment Variables</TocItem>
                <TocItem href="#rest-api">REST API</TocItem>
                <TocItem href="#api-rooms" indent={1}>Room APIs</TocItem>
                <TocItem href="#api-challenge" indent={1}>Challenge APIs</TocItem>
                <TocItem href="#api-results" indent={1}>Results APIs</TocItem>
                <TocItem href="#websocket">WebSocket Events</TocItem>
                <TocItem href="#ws-room" indent={1}>Room Events</TocItem>
                <TocItem href="#ws-race" indent={1}>Race Events</TocItem>
                <TocItem href="#ws-challenge" indent={1}>Challenge Events</TocItem>
                <TocItem href="#database">Database Schema</TocItem>
                <TocItem href="#game-flow">Game Flow</TocItem>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview Section */}
            <section id="overview">
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-white/20">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                    <Zap className="w-8 h-8 text-yellow-400" />
                    Overview
                  </h2>
                  <p className="text-white/80 text-lg leading-relaxed mb-6">
                    ThitaInfo Games is a real-time multiplayer typing race application built with 
                    Next.js 14, Socket.IO, and MongoDB. Players can create rooms, invite friends, 
                    and compete in typing races to see who can type the fastest and most accurately.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <Users className="w-8 h-8 text-blue-400 mb-2" />
                      <h4 className="font-semibold mb-1">Multiplayer</h4>
                      <p className="text-sm text-white/60">Up to 50 players per room</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <Wifi className="w-8 h-8 text-green-400 mb-2" />
                      <h4 className="font-semibold mb-1">Real-time</h4>
                      <p className="text-sm text-white/60">Live progress updates via WebSocket</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
                      <h4 className="font-semibold mb-1">Competitive</h4>
                      <p className="text-sm text-white/60">Track WPM, accuracy, and rankings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Tech Stack */}
            <section id="tech-stack">
              <CollapsibleSection title="Tech Stack" icon={Code} defaultOpen={true}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-cyan-400">Frontend</h4>
                    <ul className="space-y-2 text-white/70">
                      <li className="flex items-center gap-2">
                        <Badge className="bg-white/10">Next.js 14</Badge>
                        React Framework with App Router
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge className="bg-white/10">React 18</Badge>
                        UI Library with Hooks
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge className="bg-white/10">Tailwind CSS</Badge>
                        Utility-first CSS
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge className="bg-white/10">Lucide React</Badge>
                        Icon Library
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-cyan-400">Backend</h4>
                    <ul className="space-y-2 text-white/70">
                      <li className="flex items-center gap-2">
                        <Badge className="bg-white/10">Node.js</Badge>
                        JavaScript Runtime
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge className="bg-white/10">Socket.IO</Badge>
                        Real-time WebSocket
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge className="bg-white/10">MongoDB</Badge>
                        NoSQL Database
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge className="bg-white/10">Custom Server</Badge>
                        HTTP + Socket.IO
                      </li>
                    </ul>
                  </div>
                </div>
              </CollapsibleSection>
            </section>

            {/* Project Structure */}
            <section id="project-structure">
              <CollapsibleSection title="Project Structure" icon={Folder} defaultOpen={true}>
                <p className="text-white/70 mb-4">
                  The project follows Next.js 14 App Router conventions with a custom server for Socket.IO support.
                </p>
                <CodeBlock
                  title="Directory Structure"
                  code={`thitainfo-games/
├── app/                          # Next.js App Router
│   ├── api/                      # REST API Routes
│   │   └── typer/
│   │       ├── accept-challenge/ # POST - Accept a challenge
│   │       ├── challenge/[id]/   # GET - Get challenge details
│   │       ├── create-challenge/ # POST - Create new challenge
│   │       ├── create-room/      # POST - Create race room
│   │       ├── get-history/      # GET - Get typing history
│   │       ├── join-room/        # POST - Join existing room
│   │       ├── room/[roomId]/    # GET - Get room details
│   │       ├── save-race-result/ # POST - Save race results
│   │       └── save-result/      # POST - Save solo result
│   ├── docs/                     # Documentation page
│   ├── typer/                    # Typer game pages
│   │   ├── challenge/[id]/       # Challenge race page
│   │   ├── race/                 # Multiplayer race page
│   │   └── page.js               # Mode selector
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout
│   └── page.js                   # Home page
│
├── components/                   # React Components
│   ├── layout/
│   │   ├── footer.jsx            # Footer component
│   │   └── navbar.jsx            # Navigation bar
│   ├── typer/
│   │   ├── ChallengeLink.jsx     # Share challenge link
│   │   ├── Confetti.jsx          # Winner celebration
│   │   ├── LiveLeaderboard.jsx   # Real-time leaderboard
│   │   ├── ModeSelector.jsx      # Game mode selector
│   │   ├── RaceCountdown.jsx     # 3-2-1 countdown
│   │   └── RoomLobby.jsx         # Room waiting area
│   └── ui/                       # UI primitives (shadcn)
│       ├── badge.jsx
│       ├── button.jsx
│       ├── card.jsx
│       └── input.jsx
│
├── lib/                          # Library code
│   ├── socket/
│   │   ├── client.js             # Socket.IO client hook
│   │   └── server.js             # Socket.IO server setup
│   └── utils.js                  # Utility functions (cn)
│
├── server.js                     # Custom HTTP + Socket server
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind configuration
└── next.config.js                # Next.js configuration`}
                />
              </CollapsibleSection>
            </section>

            {/* Getting Started */}
            <section id="getting-started">
              <CollapsibleSection title="Getting Started" icon={GitBranch} defaultOpen={true}>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-3">1. Clone the Repository</h4>
                    <CodeBlock code={`git clone https://github.com/your-repo/thitainfo-games.git
cd thitainfo-games`} />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-3">2. Install Dependencies</h4>
                    <CodeBlock code={`# Using yarn (recommended)
yarn install

# Or using npm
npm install`} />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-3">3. Set Environment Variables</h4>
                    <CodeBlock code={`# Create .env.local file
cp .env.example .env.local

# Edit with your values
MONGO_URL=mongodb://localhost:27017
DB_NAME=thitainfo_games
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000`} />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-3">4. Start Development Server</h4>
                    <CodeBlock code={`# Start the server (includes Socket.IO)
yarn dev

# Server runs at http://localhost:3000
# Socket.IO available at ws://localhost:3000/api/socket.io`} />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-3">5. Production Build</h4>
                    <CodeBlock code={`# Build for production
yarn build

# Start production server
yarn start`} />
                  </div>
                </div>
              </CollapsibleSection>
            </section>

            {/* Environment Variables */}
            <section id="environment">
              <CollapsibleSection title="Environment Variables" icon={Server}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-cyan-400">Variable</th>
                        <th className="text-left py-3 px-4 text-cyan-400">Required</th>
                        <th className="text-left py-3 px-4 text-cyan-400">Description</th>
                        <th className="text-left py-3 px-4 text-cyan-400">Default</th>
                      </tr>
                    </thead>
                    <tbody className="text-white/70">
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4 font-mono text-yellow-400">MONGO_URL</td>
                        <td className="py-3 px-4"><Badge className="bg-red-500/20 text-red-400">Yes</Badge></td>
                        <td className="py-3 px-4">MongoDB connection string</td>
                        <td className="py-3 px-4">-</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4 font-mono text-yellow-400">DB_NAME</td>
                        <td className="py-3 px-4"><Badge className="bg-gray-500/20 text-gray-400">No</Badge></td>
                        <td className="py-3 px-4">Database name</td>
                        <td className="py-3 px-4 font-mono">thitainfo_games</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4 font-mono text-yellow-400">PORT</td>
                        <td className="py-3 px-4"><Badge className="bg-gray-500/20 text-gray-400">No</Badge></td>
                        <td className="py-3 px-4">Server port</td>
                        <td className="py-3 px-4 font-mono">3000</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4 font-mono text-yellow-400">HOSTNAME</td>
                        <td className="py-3 px-4"><Badge className="bg-gray-500/20 text-gray-400">No</Badge></td>
                        <td className="py-3 px-4">Server hostname</td>
                        <td className="py-3 px-4 font-mono">0.0.0.0</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4 font-mono text-yellow-400">NEXT_PUBLIC_BASE_URL</td>
                        <td className="py-3 px-4"><Badge className="bg-gray-500/20 text-gray-400">No</Badge></td>
                        <td className="py-3 px-4">Public URL for links</td>
                        <td className="py-3 px-4 font-mono">http://localhost:3000</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4 font-mono text-yellow-400">NEXT_PUBLIC_SOCKET_URL</td>
                        <td className="py-3 px-4"><Badge className="bg-gray-500/20 text-gray-400">No</Badge></td>
                        <td className="py-3 px-4">Socket.IO server URL</td>
                        <td className="py-3 px-4 font-mono">window.location.origin</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono text-yellow-400">CORS_ORIGINS</td>
                        <td className="py-3 px-4"><Badge className="bg-gray-500/20 text-gray-400">No</Badge></td>
                        <td className="py-3 px-4">Allowed CORS origins (comma-separated)</td>
                        <td className="py-3 px-4 font-mono">*</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CollapsibleSection>
            </section>

            {/* REST API Section */}
            <section id="rest-api">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Globe className="w-8 h-8 text-green-400" />
                REST API Reference
              </h2>
              
              {/* Room APIs */}
              <div id="api-rooms">
                <CollapsibleSection title="Room APIs" icon={Users} defaultOpen={true}>
                  <ApiEndpoint
                    method="POST"
                    path="/api/typer/create-room"
                    description="Create a new race room. The creator becomes the host and can start the race."
                    requestBody={{
                      hostId: "socket_id_abc123",
                      maxPlayers: 10,
                      text: "Optional custom text (random if not provided)"
                    }}
                    responseBody={{
                      success: true,
                      data: {
                        roomId: "ABC123",
                        text: "The quick brown fox...",
                        maxPlayers: 10
                      }
                    }}
                    statusCodes={[
                      { code: 200, meaning: "Room created successfully" },
                      { code: 400, meaning: "Missing hostId" },
                      { code: 500, meaning: "Server error" }
                    ]}
                  />

                  <ApiEndpoint
                    method="POST"
                    path="/api/typer/join-room"
                    description="Validate and join an existing room. Returns room info if valid."
                    requestBody={{
                      roomId: "ABC123"
                    }}
                    responseBody={{
                      success: true,
                      data: {
                        roomId: "ABC123",
                        text: "The quick brown fox...",
                        players: 3,
                        maxPlayers: 10,
                        status: "waiting"
                      }
                    }}
                    statusCodes={[
                      { code: 200, meaning: "Can join room" },
                      { code: 400, meaning: "Room full or race started" },
                      { code: 404, meaning: "Room not found" }
                    ]}
                  />

                  <ApiEndpoint
                    method="GET"
                    path="/api/typer/room/[roomId]"
                    description="Get detailed information about a specific room."
                    responseBody={{
                      success: true,
                      data: {
                        roomId: "ABC123",
                        hostId: "socket_id_abc123",
                        text: "The quick brown fox...",
                        status: "waiting",
                        maxPlayers: 10,
                        players: [
                          {
                            socketId: "socket_123",
                            username: "Player1",
                            progress: 0,
                            wpm: 0,
                            accuracy: 100,
                            finished: false
                          }
                        ],
                        createdAt: "2024-01-15T10:30:00Z"
                      }
                    }}
                    statusCodes={[
                      { code: 200, meaning: "Room found" },
                      { code: 404, meaning: "Room not found" }
                    ]}
                  />
                </CollapsibleSection>
              </div>

              {/* Challenge APIs */}
              <div id="api-challenge">
                <CollapsibleSection title="Challenge APIs" icon={Trophy}>
                  <ApiEndpoint
                    method="POST"
                    path="/api/typer/create-challenge"
                    description="Create a 1v1 challenge with a shareable link. Expires in 24 hours."
                    requestBody={{
                      challengerId: "socket_id_abc123",
                      challengerName: "PlayerName",
                      text: "Optional custom text"
                    }}
                    responseBody={{
                      success: true,
                      data: {
                        challengeId: "challenge_1705312200_abc123",
                        challengeLink: "http://localhost:3000/typer/challenge/challenge_1705312200_abc123",
                        text: "The quick brown fox..."
                      }
                    }}
                    statusCodes={[
                      { code: 200, meaning: "Challenge created" },
                      { code: 400, meaning: "Missing required fields" }
                    ]}
                  />

                  <ApiEndpoint
                    method="GET"
                    path="/api/typer/challenge/[challengeId]"
                    description="Get challenge details. Used when someone opens the challenge link."
                    responseBody={{
                      success: true,
                      data: {
                        challengeId: "challenge_1705312200_abc123",
                        challengerName: "PlayerName",
                        text: "The quick brown fox...",
                        status: "pending",
                        createdAt: "2024-01-15T10:30:00Z"
                      }
                    }}
                    statusCodes={[
                      { code: 200, meaning: "Challenge found" },
                      { code: 400, meaning: "Challenge expired or completed" },
                      { code: 404, meaning: "Challenge not found" }
                    ]}
                  />

                  <ApiEndpoint
                    method="POST"
                    path="/api/typer/accept-challenge"
                    description="Validate a challenge before accepting via WebSocket."
                    requestBody={{
                      challengeId: "challenge_1705312200_abc123"
                    }}
                    responseBody={{
                      success: true,
                      message: "Challenge is valid and ready to be accepted",
                      data: {
                        challengeId: "challenge_1705312200_abc123",
                        text: "The quick brown fox...",
                        challengerName: "PlayerName"
                      }
                    }}
                    statusCodes={[
                      { code: 200, meaning: "Challenge valid" },
                      { code: 400, meaning: "Already accepted or expired" },
                      { code: 404, meaning: "Challenge not found" }
                    ]}
                  />
                </CollapsibleSection>
              </div>

              {/* Results APIs */}
              <div id="api-results">
                <CollapsibleSection title="Results APIs" icon={Database}>
                  <ApiEndpoint
                    method="POST"
                    path="/api/typer/save-result"
                    description="Save a solo typing test result."
                    requestBody={{
                      wpm: 65,
                      accuracy: 98.5,
                      time: 45.2,
                      errors: 3,
                      date: "2024-01-15T10:30:00Z"
                    }}
                    responseBody={{
                      success: true,
                      message: "Result saved successfully",
                      data: {
                        wpm: 65,
                        accuracy: 98.5,
                        time: 45.2,
                        errors: 3,
                        createdAt: "2024-01-15T10:30:00Z"
                      }
                    }}
                    statusCodes={[
                      { code: 200, meaning: "Result saved" },
                      { code: 400, meaning: "Invalid data format" }
                    ]}
                  />

                  <ApiEndpoint
                    method="POST"
                    path="/api/typer/save-race-result"
                    description="Save multiplayer race results (usually called by server)."
                    requestBody={{
                      roomId: "ABC123",
                      challengeId: null,
                      players: [
                        {
                          username: "Player1",
                          wpm: 75,
                          accuracy: 99,
                          time: 38.5,
                          errors: 2,
                          finished: true
                        }
                      ]
                    }}
                    responseBody={{
                      success: true,
                      message: "Race result saved successfully"
                    }}
                  />

                  <ApiEndpoint
                    method="GET"
                    path="/api/typer/get-history?limit=10"
                    description="Get recent typing test history."
                    responseBody={{
                      success: true,
                      data: [
                        {
                          wpm: 65,
                          accuracy: 98.5,
                          time: 45.2,
                          errors: 3,
                          createdAt: "2024-01-15T10:30:00Z"
                        }
                      ],
                      count: 1
                    }}
                  />
                </CollapsibleSection>
              </div>
            </section>

            {/* WebSocket Section */}
            <section id="websocket">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Wifi className="w-8 h-8 text-purple-400" />
                WebSocket Events
              </h2>
              
              <Card className="bg-gray-900/50 border-white/10 mb-6">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-cyan-400 mb-3">Connection Setup</h4>
                  <CodeBlock
                    code={`import { io } from "socket.io-client";

// Connect to Socket.IO server
const socket = io("http://localhost:3000", {
  path: "/api/socket.io",
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Connection events
socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

socket.on("error", (error) => {
  console.error("Socket error:", error.message);
});`}
                  />
                </CardContent>
              </Card>

              {/* Room Events */}
              <div id="ws-room">
                <CollapsibleSection title="Room Events" icon={Users} defaultOpen={true}>
                  <SocketEvent
                    name="join-room"
                    direction="emit"
                    description="Join a race room with a username. Must be called after room is created via REST API."
                    payload={{
                      roomId: "ABC123",
                      username: "PlayerName"
                    }}
                  />

                  <SocketEvent
                    name="joined-room"
                    direction="on"
                    description="Confirmation that you've joined the room successfully."
                    payload={{
                      roomId: "ABC123",
                      player: {
                        socketId: "socket_123",
                        username: "PlayerName",
                        progress: 0,
                        wpm: 0,
                        accuracy: 100,
                        errors: 0,
                        finished: false
                      }
                    }}
                  />

                  <SocketEvent
                    name="room-update"
                    direction="on"
                    description="Broadcasted whenever room state changes (player join/leave, progress updates)."
                    payload={{
                      roomId: "ABC123",
                      hostId: "socket_host",
                      status: "waiting | starting | active | finished",
                      players: [
                        {
                          socketId: "socket_123",
                          username: "Player1",
                          progress: 45.5,
                          wpm: 62,
                          accuracy: 97,
                          errors: 5,
                          finished: false
                        }
                      ],
                      text: "The quick brown fox..."
                    }}
                  />

                  <SocketEvent
                    name="leave-room"
                    direction="emit"
                    description="Leave the current room."
                    payload={{
                      roomId: "ABC123"
                    }}
                  />
                </CollapsibleSection>
              </div>

              {/* Race Events */}
              <div id="ws-race">
                <CollapsibleSection title="Race Events" icon={Zap} defaultOpen={true}>
                  <SocketEvent
                    name="start-race"
                    direction="emit"
                    description="Start the race (host only). Triggers countdown for all players."
                    payload={{
                      roomId: "ABC123"
                    }}
                  />

                  <SocketEvent
                    name="race-countdown"
                    direction="on"
                    description="Countdown before race starts. Sent 3 times (3, 2, 1)."
                    payload={{
                      countdown: 3
                    }}
                  />

                  <SocketEvent
                    name="race-started"
                    direction="on"
                    description="Race has started. Players can now begin typing."
                    payload={{
                      startedAt: "2024-01-15T10:30:00Z"
                    }}
                  />

                  <SocketEvent
                    name="player-progress"
                    direction="emit"
                    description="Update your typing progress. Should be sent periodically (every 500ms)."
                    payload={{
                      roomId: "ABC123",
                      progress: 45.5,
                      wpm: 62,
                      accuracy: 97,
                      errors: 5,
                      finished: false
                    }}
                  />

                  <SocketEvent
                    name="player-finished"
                    direction="emit"
                    description="Notify server that you've completed typing. First player to finish wins!"
                    payload={{
                      roomId: "ABC123",
                      wpm: 75,
                      accuracy: 99,
                      errors: 2,
                      time: 38.5
                    }}
                  />

                  <SocketEvent
                    name="race-finished"
                    direction="on"
                    description="Race has ended. Contains final results and winner info."
                    payload={{
                      roomId: "ABC123",
                      winner: {
                        socketId: "socket_winner",
                        username: "Winner",
                        wpm: 75,
                        accuracy: 99,
                        errors: 2,
                        time: 38.5
                      },
                      results: [
                        {
                          socketId: "socket_123",
                          username: "Player1",
                          wpm: 75,
                          accuracy: 99,
                          time: 38.5,
                          finished: true
                        },
                        {
                          socketId: "socket_456",
                          username: "Player2",
                          wpm: 60,
                          accuracy: 95,
                          time: 45.2,
                          finished: true
                        }
                      ]
                    }}
                  />
                </CollapsibleSection>
              </div>

              {/* Challenge Events */}
              <div id="ws-challenge">
                <CollapsibleSection title="Challenge Events" icon={Trophy}>
                  <SocketEvent
                    name="accept-challenge"
                    direction="emit"
                    description="Accept a 1v1 challenge. Creates a race room for both players."
                    payload={{
                      challengeId: "challenge_1705312200_abc123",
                      username: "Opponent"
                    }}
                  />

                  <SocketEvent
                    name="challenge-accepted"
                    direction="on"
                    description="Challenge has been accepted. Both players receive this with room info."
                    payload={{
                      challengeId: "challenge_1705312200_abc123",
                      roomId: "challenge_challenge_1705312200_abc123"
                    }}
                  />
                </CollapsibleSection>
              </div>
            </section>

            {/* Database Schema */}
            <section id="database">
              <CollapsibleSection title="Database Schema" icon={Database}>
                <p className="text-white/70 mb-6">
                  MongoDB collections used by the application:
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-3">typer_rooms</h4>
                    <CodeBlock
                      code={`{
  roomId: "ABC123",              // 6-char unique code
  hostId: "socket_abc123",       // Socket ID of room creator
  text: "The quick brown...",    // Text to type
  status: "waiting",             // waiting | starting | active | finished
  maxPlayers: 10,                // Max players allowed
  players: [
    {
      socketId: "socket_123",
      username: "Player1",
      progress: 0,               // 0-100 percentage
      wpm: 0,                    // Words per minute
      accuracy: 100,             // Percentage
      errors: 0,                 // Error count
      finished: false,           // Completed typing?
      finishedAt: null,          // Completion timestamp
      time: null,                // Completion time in seconds
      joinedAt: ISODate()
    }
  ],
  winnerId: null,                // Socket ID of winner
  winnerName: null,              // Username of winner
  createdAt: ISODate(),
  startedAt: null,               // Race start time
  finishedAt: null               // Race end time
}`}
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-3">typer_challenges</h4>
                    <CodeBlock
                      code={`{
  challengeId: "challenge_1705312200_abc123",
  challengerId: "socket_abc123",    // Creator's socket ID
  challengerName: "Player1",
  challengeLink: "http://.../challenge/...",
  text: "The quick brown...",
  status: "pending",                // pending | accepted | completed
  opponentId: null,                 // Set when accepted
  opponentName: null,
  results: {},                      // Final results when completed
  createdAt: ISODate(),
  expiresAt: ISODate()              // 24 hours after creation
}`}
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-3">typer_results</h4>
                    <CodeBlock
                      code={`{
  wpm: 65,
  accuracy: 98.5,
  time: 45.2,           // Seconds
  errors: 3,
  date: "2024-01-15",   // User-provided date string
  createdAt: ISODate()
}`}
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-3">typer_race_results</h4>
                    <CodeBlock
                      code={`{
  roomId: "ABC123",
  challengeId: null,          // If from a challenge
  winnerId: "socket_123",
  winnerName: "Player1",
  winnerWpm: 75,
  winnerAccuracy: 99,
  players: [
    {
      socketId: "socket_123",
      username: "Player1",
      wpm: 75,
      accuracy: 99,
      time: 38.5,
      errors: 2,
      finished: true
    }
  ],
  finishedAt: ISODate(),
  createdAt: ISODate()
}`}
                    />
                  </div>
                </div>
              </CollapsibleSection>
            </section>

            {/* Game Flow */}
            <section id="game-flow">
              <CollapsibleSection title="Game Flow" icon={Zap} defaultOpen={true}>
                <div className="space-y-8">
                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-4">Multiplayer Race Flow</h4>
                    <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
                      <ol className="space-y-4">
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">1</span>
                          <div>
                            <strong className="text-white">Create Room</strong>
                            <p className="text-white/60 text-sm mt-1">Host calls POST /api/typer/create-room → Gets roomId</p>
                          </div>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">2</span>
                          <div>
                            <strong className="text-white">Join Room</strong>
                            <p className="text-white/60 text-sm mt-1">All players emit socket "join-room" with roomId & username</p>
                          </div>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">3</span>
                          <div>
                            <strong className="text-white">Wait in Lobby</strong>
                            <p className="text-white/60 text-sm mt-1">Players see LiveLeaderboard via "room-update" events</p>
                          </div>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">4</span>
                          <div>
                            <strong className="text-white">Start Race</strong>
                            <p className="text-white/60 text-sm mt-1">Host emits "start-race" → All receive "race-countdown" (3,2,1)</p>
                          </div>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">5</span>
                          <div>
                            <strong className="text-white">Race Active</strong>
                            <p className="text-white/60 text-sm mt-1">Players type & emit "player-progress" every 500ms</p>
                          </div>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">6</span>
                          <div>
                            <strong className="text-white">Finish</strong>
                            <p className="text-white/60 text-sm mt-1">First player done emits "player-finished" → All receive "race-finished"</p>
                          </div>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">7</span>
                          <div>
                            <strong className="text-white">Results</strong>
                            <p className="text-white/60 text-sm mt-1">Show leaderboard with winner, WPM, accuracy, and times</p>
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-4">Key Implementation Notes</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-white/10">
                        <h5 className="font-semibold text-yellow-400 mb-2">⚡ Progress Updates</h5>
                        <p className="text-white/60 text-sm">
                          Send player-progress every 500ms during race. Includes progress %, WPM, accuracy, and error count.
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-white/10">
                        <h5 className="font-semibold text-yellow-400 mb-2">🏆 Winner Detection</h5>
                        <p className="text-white/60 text-sm">
                          First player to emit "player-finished" wins. Server broadcasts "race-finished" to all players.
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-white/10">
                        <h5 className="font-semibold text-yellow-400 mb-2">⏱️ Race Timeout</h5>
                        <p className="text-white/60 text-sm">
                          Race auto-ends after 5 minutes (300 seconds). Unfinished players marked as DNF.
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-white/10">
                        <h5 className="font-semibold text-yellow-400 mb-2">🔌 Disconnect Handling</h5>
                        <p className="text-white/60 text-sm">
                          Players auto-removed from rooms on disconnect. Other players notified via room-update.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            </section>

            {/* Footer */}
            <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-white/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
                <p className="text-white/70 mb-6">
                  This documentation covers the main features of ThitaInfo Games. 
                  For questions or issues, check the source code or create an issue on GitHub.
                </p>
                <div className="flex justify-center gap-4">
                  <Link
                    href="/typer"
                    className="inline-flex items-center px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Try the Game
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/20"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

