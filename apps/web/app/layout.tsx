import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Excalidraw",
  description: "A virtual whiteboard for effective note taking and live collaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
