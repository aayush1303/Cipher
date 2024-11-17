import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Load custom fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Metadata
export const metadata = {
  title: "Cipher",
  description: "A real-time chat application built with Next.js and Firebase.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Link to the manifest.json file */}
          <link rel="manifest" href="/manifest.json" />

          {/* Favicon */}
          <link rel="icon" href="/icons/icon2.png" sizes="128x128" />
          <link rel="icon" href="/icons/icons1.png" sizes="512x512" />

          {/* Apple Touch Icon for iOS */}
          <link rel="apple-touch-icon" href="/icons/icons1.png" />

          {/* Theme color for the browser's address bar */}
          <meta name="theme-color" content="#ffffff" />

          {/* Meta tag for mobile responsiveness */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          {/* Description for search engines */}
          <meta name="description" content="A real-time chat application built with Next.js and Firebase." />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              {children}
            </TooltipProvider>
            <Toaster richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
