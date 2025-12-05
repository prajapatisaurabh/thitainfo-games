import "./globals.css";

export const metadata = {
  title: "ThitaInfo Games - Play & Compete",
  description:
    "Fun and interactive games for developers. Test your skills and improve your abilities!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-poppins antialiased">{children}</body>
    </html>
  );
}
