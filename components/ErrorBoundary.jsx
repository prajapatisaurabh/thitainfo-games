"use client";

import { Component } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    // Report to server-side error log (replace with Sentry etc. as needed)
    try {
      fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo?.componentStack,
          url: typeof window !== "undefined" ? window.location.href : "",
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {}); // swallow network errors — reporting must never crash the app
    } catch {
      // noop
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen gradient-dark animate-gradient text-white flex items-center justify-center p-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm max-w-md w-full">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-white">
                Something went wrong
              </h2>
              <p className="text-white/70 mb-6">
                {this.props.fallbackMessage ||
                  "An unexpected error occurred. Please try again."}
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <pre className="text-left text-xs text-red-400 bg-red-400/10 p-3 rounded mb-4 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  className="btn-cartoon bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  asChild
                  className="btn-cartoon bg-gray-600 hover:bg-gray-700 text-white border-0"
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
