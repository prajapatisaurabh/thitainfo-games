import { Heart, Gamepad2 } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-white/10 py-10 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Link
              href="/"
              className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4 inline-block"
            >
              <Gamepad2 className="inline-block w-6 h-6 mr-2 text-blue-400" />
              ThitaInfo Games
            </Link>
            <p className="text-white/70 mb-4 text-base sm:text-lg leading-relaxed">
              Fun and interactive games for developers. Test your skills and improve your abilities!
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-white">
              Quick Links
            </h3>
            <div className="space-y-2.5 sm:space-y-3">
              <Link
                href="/typer"
                className="block text-white/70 hover:text-white transition-colors text-base sm:text-lg"
              >
                Typer Game
              </Link>
              <Link
                href="/typer/race"
                className="block text-white/70 hover:text-white transition-colors text-base sm:text-lg"
              >
                Race Mode
              </Link>
              <Link
                href="/typer/challenge"
                className="block text-white/70 hover:text-white transition-colors text-base sm:text-lg"
              >
                Challenge Friends
              </Link>
              <Link
                href="https://thitainfo.com"
                target="_blank"
                className="block text-white/70 hover:text-white transition-colors text-base sm:text-lg"
              >
                Main Website
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 sm:pt-8 text-center text-white/70">
          <p className="text-sm sm:text-base md:text-lg">
            &copy; {currentYear} ThitaInfo Games. All rights reserved. Built with
            <Heart className="inline w-5 h-5 mx-1 text-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}

