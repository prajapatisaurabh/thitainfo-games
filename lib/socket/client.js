"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      socket = io(socketUrl, {
        path: "/api/socket.io",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        console.log("Socket.io: Connected to server");
        setIsConnected(true);
        setSocketInstance(socket);
      });

      socket.on("disconnect", () => {
        console.log("Socket.io: Disconnected from server");
        setIsConnected(false);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket.io: Connection error:", error);
        setIsConnected(false);
      });
    } else {
      setSocketInstance(socket);
      setIsConnected(socket.connected);
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
      // socket?.disconnect();
    };
  }, []);

  return { socket: socketInstance, isConnected };
}

export function getSocket() {
  if (!socket) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    socket = io(socketUrl, {
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
    });
  }
  return socket;
}
