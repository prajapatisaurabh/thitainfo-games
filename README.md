# 🎮 ThitaInfo Games

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-6.6-47A248?style=for-the-badge&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

**A fun and interactive typing game platform for developers to challenge themselves and compete with friends!**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Game Modes](#-game-modes) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

ThitaInfo Games is a modern, real-time multiplayer typing game platform built with Next.js 14 and Socket.io. Test your typing speed, compete in real-time races with friends, and create shareable challenges to prove who's the fastest typist!

## ✨ Features

### 🎯 Core Features

- **Real-time WPM Tracking** - Monitor your words per minute as you type
- **Accuracy Measurement** - Track your typing precision with live accuracy stats
- **Error Counting** - See exactly where you make mistakes
- **Progress Saving** - All results are saved to MongoDB for tracking improvement
- **Responsive Design** - Beautiful UI that works on desktop and mobile

### 🏁 Game Modes

| Mode               | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| **Single Player**  | Practice solo and improve your typing speed at your own pace    |
| **Race Mode**      | Create or join rooms to race against other players in real-time |
| **Challenge Mode** | Create shareable challenge links and compete asynchronously     |

### 🎨 User Experience

- Modern, dark-themed UI with glassmorphism effects
- Smooth animations and transitions
- Real-time countdown before races
- Live leaderboard during multiplayer races
- Beautiful result screens with rankings

## 🛠 Tech Stack

### Frontend

| Technology           | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| **Next.js 14**       | React framework with App Router for server-side rendering |
| **React 18**         | UI component library with hooks                           |
| **Tailwind CSS 3.4** | Utility-first CSS framework                               |
| **Radix UI**         | Unstyled, accessible UI primitives                        |
| **Lucide React**     | Beautiful, customizable icons                             |
| **Socket.io Client** | Real-time bidirectional communication                     |

### Backend

| Technology             | Purpose                                 |
| ---------------------- | --------------------------------------- |
| **Node.js**            | JavaScript runtime environment          |
| **Next.js API Routes** | Serverless API endpoints                |
| **Socket.io Server**   | WebSocket server for real-time features |
| **MongoDB**            | NoSQL database for data persistence     |

### Styling & UI

| Technology                   | Purpose                              |
| ---------------------------- | ------------------------------------ |
| **Tailwind CSS**             | Utility-first styling                |
| **tailwindcss-animate**      | Animation utilities                  |
| **class-variance-authority** | Type-safe component variants         |
| **clsx**                     | Conditional className utility        |
| **tailwind-merge**           | Merge Tailwind classes intelligently |

### DevOps & Deployment

| Technology            | Purpose                                     |
| --------------------- | ------------------------------------------- |
| **Docker**            | Containerization for consistent deployments |
| **Node.js 18 Alpine** | Lightweight production image                |

## 📁 Project Structure

```
thitainfo-games/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── typer/               # Typer game API endpoints
│   │       ├── accept-challenge/ # Accept challenge endpoint
│   │       ├── challenge/        # Get challenge data
│   │       ├── create-challenge/ # Create new challenge
│   │       ├── create-room/      # Create multiplayer room
│   │       ├── get-history/      # Get user history
│   │       ├── join-room/        # Join existing room
│   │       ├── room/             # Get room data
│   │       ├── save-race-result/ # Save race results
│   │       └── save-result/      # Save single player result
│   ├── typer/                    # Typer game pages
│   │   ├── challenge/            # Challenge mode
│   │   │   └── [challengeId]/    # Dynamic challenge page
│   │   ├── race/                 # Race mode
│   │   └── page.js               # Single player mode
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout
│   └── page.js                   # Home page
├── components/                   # React components
│   ├── layout/                   # Layout components
│   │   ├── footer.jsx
│   │   └── navbar.jsx
│   ├── typer/                    # Typer game components
│   │   ├── ChallengeLink.jsx     # Shareable challenge link
│   │   ├── LiveLeaderboard.jsx   # Real-time leaderboard
│   │   ├── ModeSelector.jsx      # Game mode selection
│   │   ├── RaceCountdown.jsx     # Countdown before race
│   │   └── RoomLobby.jsx         # Room lobby component
│   └── ui/                       # Reusable UI components
│       ├── badge.jsx
│       ├── button.jsx
│       ├── card.jsx
│       └── input.jsx
├── lib/                          # Utility libraries
│   ├── socket/                   # Socket.io configuration
│   │   ├── client.js             # Client-side socket hook
│   │   └── server.js             # Server-side socket setup
│   └── utils.js                  # Utility functions
├── server.js                     # Custom Node.js server
├── Dockerfile                    # Docker configuration
├── tailwind.config.js            # Tailwind configuration
├── next.config.js                # Next.js configuration
└── package.json                  # Project dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **MongoDB** database (local or cloud)
- **Yarn** or **npm** package manager

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=thitainfo_games

# Socket.io Configuration (optional)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

# Server Configuration
PORT=3000
HOSTNAME=localhost
```

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/thitainfo-games.git
   cd thitainfo-games
   ```

2. **Install dependencies**

   ```bash
   yarn install
   # or
   npm install
   ```

3. **Start development server**

   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Deployment

1. **Build the Docker image**

   ```bash
   docker build -t thitainfo-games .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 \
     -e MONGO_URL=your_mongodb_url \
     -e DB_NAME=thitainfo_games \
     thitainfo-games
   ```

## 🎮 Game Modes

### Single Player Mode

Practice your typing skills at your own pace:

1. Navigate to `/typer`
2. Start typing the displayed text
3. View real-time WPM, accuracy, and error count
4. Complete the text to see your final results
5. Results are saved automatically

### Race Mode

Compete with friends in real-time:

1. Navigate to `/typer/race`
2. Enter your username
3. Create a new room or join with a room code
4. Share the room code with friends
5. Host starts the race when everyone is ready
6. Type as fast as you can!
7. View the live leaderboard and final rankings

### Challenge Mode

Create shareable challenges:

1. Navigate to `/typer/challenge`
2. Enter your username
3. Create a challenge to generate a shareable link
4. Share the link with friends
5. They can accept and compete against you

## 📜 Available Scripts

| Script       | Description                              |
| ------------ | ---------------------------------------- |
| `yarn dev`   | Start development server with hot reload |
| `yarn build` | Build for production                     |
| `yarn start` | Start production server                  |
| `yarn lint`  | Run ESLint for code quality              |

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork the repository**

   Click the "Fork" button at the top right of this page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/your-username/thitainfo-games.git
   cd thitainfo-games
   ```

3. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**

   Write clean, documented code following the existing style.

5. **Test your changes**

   ```bash
   yarn dev
   ```

6. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

7. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**

   Go to the original repository and click "New Pull Request".

### Contribution Guidelines

- **Code Style**: Follow the existing code style and conventions
- **Commits**: Use meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- **Documentation**: Update README if adding new features
- **Testing**: Test your changes thoroughly before submitting
- **Issues**: Check existing issues before creating new ones

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🌐 Internationalization (i18n)
- ♿ Accessibility improvements

## 📊 API Endpoints

| Endpoint                             | Method | Description                   |
| ------------------------------------ | ------ | ----------------------------- |
| `/api/typer/create-room`             | POST   | Create a new multiplayer room |
| `/api/typer/join-room`               | POST   | Join an existing room         |
| `/api/typer/room/[roomId]`           | GET    | Get room data                 |
| `/api/typer/create-challenge`        | POST   | Create a new challenge        |
| `/api/typer/accept-challenge`        | POST   | Accept a challenge            |
| `/api/typer/challenge/[challengeId]` | GET    | Get challenge data            |
| `/api/typer/save-result`             | POST   | Save single player result     |
| `/api/typer/save-race-result`        | POST   | Save race results             |
| `/api/typer/get-history`             | GET    | Get user typing history       |

## 🔌 Socket.io Events

### Client → Server

| Event              | Payload                                                 | Description                |
| ------------------ | ------------------------------------------------------- | -------------------------- |
| `join-room`        | `{ roomId, username }`                                  | Join a multiplayer room    |
| `leave-room`       | `{ roomId }`                                            | Leave a room               |
| `player-progress`  | `{ roomId, progress, wpm, accuracy, errors, finished }` | Update player progress     |
| `start-race`       | `{ roomId }`                                            | Start the race (host only) |
| `accept-challenge` | `{ challengeId, username }`                             | Accept a challenge         |

### Server → Client

| Event                | Payload                   | Description            |
| -------------------- | ------------------------- | ---------------------- |
| `room-update`        | `Room object`             | Room data updated      |
| `race-countdown`     | `{ countdown }`           | Countdown tick         |
| `race-started`       | `{ startedAt }`           | Race has started       |
| `challenge-accepted` | `{ challengeId, roomId }` | Challenge was accepted |
| `error`              | `{ message }`             | Error occurred         |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Socket.io](https://socket.io/) - Real-time communication
- [MongoDB](https://www.mongodb.com/) - Database
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [Lucide](https://lucide.dev/) - Beautiful icons

---

<div align="center">

**Made with ❤️ by ThitaInfo**

[⬆ Back to Top](#-thitainfo-games)

</div>

# Build and run

docker-compose up --build

# Run in background

docker-compose up -d --build

# View logs

docker-compose logs -f app

# Stop

docker-compose down

# Build and run

docker-compose -f docker-compose.local.yml up --build

# Run in background

docker-compose -f docker-compose.local.yml up -d --build

# View logs

docker-compose -f docker-compose.local.yml logs -f app

# Stop

docker-compose -f docker-compose.local.yml down
