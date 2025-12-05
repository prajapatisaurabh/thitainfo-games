"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2 } from "lucide-react";

export function ChallengeLink({ challengeLink, challengerName }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(challengeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${challengerName} challenged you to a typing race!`,
          text: "Can you beat my typing speed?",
          url: challengeLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyLink();
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4 text-white">
          Challenge Created!
        </h3>
        <p className="text-white/70 mb-4">
          Share this link with your friend to start the challenge:
        </p>
        <div className="flex gap-2 mb-4">
          <Input
            value={challengeLink}
            readOnly
            className="bg-gray-900/50 border-white/10 text-white"
          />
          <Button
            onClick={copyLink}
            variant="outline"
            className="bg-gray-900/50 border-white/10 text-white hover:bg-gray-800/50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
        <Button
          onClick={shareLink}
          className="w-full btn-cartoon bg-blue-600 hover:bg-blue-700 text-white border-0"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Challenge
        </Button>
      </CardContent>
    </Card>
  );
}

