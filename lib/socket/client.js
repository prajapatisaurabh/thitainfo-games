"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket = null;
let socketInitializing = false;
let socketInitCallbacks = [];

async function fetchSocketToken() {
  const res = await fetch("/api/typer/socket-token", { method: "POST" });
  if (!res.ok) throw new Error("Failed to get socket token");
  const { token } = await res.json();
  return token;
}

async function initSocket() {
  if (socket) return socket;

  // Prevent multiple simultaneous init calls
  if (socketInitializing) {
    return new Promise((resolve) => socketInitCallbacks.push(resolve));
  }

  socketInitializing = true;
  try {
    const token = await fetchSocketToken();
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    socket = io(socketUrl, {
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: { token },
    });

    // On reconnect attempt, fetch a fresh token
    socket.on("connect_error", async (err) => {
      if (err.message === "Unauthorized") {
        try {
          const newToken = await fetchSocketToken();
          socket.auth = { token: newToken };
          socket.connect();
        } catch {
          // Token fetch failed — will retry via reconnectionAttempts
        }
      }
    });
  } finally {
    socketInitializing = false;
    socketInitCallbacks.forEach((cb) => cb(socket));
    socketInitCallbacks = [];
  }

  return socket;
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    let mounted = true;

    initSocket().then((s) => {
      if (!mounted) return;
      setSocketInstance(s);
      setIsConnected(s.connected);

      s.on("connect", () => {
        if (mounted) setIsConnected(true);
      });
      s.on("disconnect", () => {
        if (mounted) setIsConnected(false);
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { socket: socketInstance, isConnected };
}

export async function getSocket() {
  return initSocket();
}
