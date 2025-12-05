"use client";

import { Menu, Gamepad2, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/85 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
          >
            <Gamepad2 className="inline-block w-6 h-6 mr-2 text-blue-400" />
            ThitaInfo Games
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-all duration-300 font-medium"
            >
              Home
            </Link>
            <Link
              href="/typer"
              className="text-white/80 hover:text-white transition-all duration-300 font-medium"
            >
              Typer
            </Link>
            <Link
              href="https://thitainfo.com"
              target="_blank"
              className="text-white/80 hover:text-white transition-all duration-300 font-medium"
            >
              Main Site
            </Link>
            <Button
              asChild
              className="btn-cartoon bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              <Link href="/typer">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Play Now
              </Link>
            </Button>
          </div>

          {/* Mobile Navigation Button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-white/10">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/"
              className="block py-2 text-white/80 hover:text-white transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/typer"
              className="block py-2 text-white/80 hover:text-white transition-colors font-medium"
            >
              Typer
            </Link>
            <Link
              href="https://thitainfo.com"
              target="_blank"
              className="block py-2 text-white/80 hover:text-white transition-colors font-medium"
            >
              Main Site
            </Link>
            <Button
              asChild
              className="w-full btn-cartoon bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              <Link href="/typer">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Play Now
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

