import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Script from "next/script";

export const metadata = {
  title: "ThitaInfo Games - Play & Compete",
  description:
    "Fun and interactive games for developers. Test your skills and improve your abilities!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          defer
          src="https://analytics.saurabhprajapati.in/script.js"
          data-website-id="8673d052-6bd3-4560-8558-844935a92e48"
          strategy="afterInteractive"
        />
      </head>
      <body className="font-poppins antialiased">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
