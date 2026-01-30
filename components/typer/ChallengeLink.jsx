"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2 } from "lucide-react";

export function ChallengeLink({ challengeLink, challengerName }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(challengeLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = challengeLink;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
      document.body.removeChild(textArea);
    }
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
    <Card className="bg-cyber-card border-cyber-border backdrop-blur-sm shadow-neon-cyan">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4 text-neon-cyan">
          Challenge Created!
        </h3>
        <p className="text-white/70 mb-4">
          Share this link with your friend to start the challenge:
        </p>
        <div className="flex gap-2 mb-4">
          <Input
            value={challengeLink}
            readOnly
            className="bg-cyber-dark border-cyber-border text-white focus:border-neon-cyan"
          />
          <Button
            onClick={copyLink}
            variant="outline"
            className={`border-cyber-border text-white hover:bg-neon-cyan/20 hover:border-neon-cyan ${
              copied ? "bg-neon-green/20 border-neon-green text-neon-green" : "bg-cyber-dark"
            }`}
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
          className="w-full bg-neon-orange hover:bg-neon-orange/80 text-white border-0 shadow-neon-orange"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Challenge
        </Button>
      </CardContent>
    </Card>
  );
}
