// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/auth-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Script from "next/script";
import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import type { Metadata, Viewport } from "next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Improves font loading performance
});

// Enhanced metadata with comprehensive SEO
export const metadata: Metadata = {
  title: {
    default: "Kenya Trails - Travel & Hiking Events",
    template: "%s | Kenya Trails", // For page-specific titles
  },
  description:
    "Discover and book exciting travel and hiking events across Kenya. Join guided tours, adventure hikes, and explore Kenya's beautiful landscapes with experienced guides.",

  // Open Graph for social media sharing
  openGraph: {
    title: "Kenya Trails - Travel & Hiking Events",
    description:
      "Discover,Plan and book exciting travel and hiking events across Kenya",
    url: "https://kenyatrails.co.ke", // Replace with your actual domain
    siteName: "Kenya Trails",
    images: [
      {
        url: "/og-image.jpg", // Add a 1200x630 image for social sharing
        width: 1200,
        height: 630,
        alt: "Kenya Trails - Hiking and Travel Adventures",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Kenya Trails - Travel & Hiking Events",
    description:
      "Discover and book exciting travel and hiking events across Kenya",
    images: ["/og-image.jpg"],
    creator: "@your_twitter_handle", // Replace with your Twitter handle
  },

  // Additional SEO tags
  keywords: [
    "Kenya hiking",
    "travel events Kenya",
    "adventure tours",
    "hiking guides Kenya",
    "outdoor activities",
    "Kenya tourism",
    "mountain climbing Kenya",
    "safari tours",
    "outdoor events",
  ],

  authors: [{ name: "Kenya Trails Team" }],
  creator: "Kenya Trails",
  publisher: "Kenya Trails",

  // Robots and indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification tags (add your actual verification codes)
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },

  // Category for better organization
  category: "travel",

  // Canonical URL
  alternates: {
    canonical: "https://kenyatrails.co.ke", // Replace with your actual domain
  },
};

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zoom on iOS
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />

        {/* Additional SEO meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Kenya" />

        {/* Structured data for better search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Kenya Trails",
              description: "Travel and hiking events company in Kenya",
              url: "https://kenyatrails.co.ke", // Replace with your domain
              logo: "https://kenyatrails.co.ke/logo.png", // Add your logo
              sameAs: [
                "https://facebook.com/your-page", // Add your social media links
                "https://twitter.com/your-handle",
                "https://instagram.com/your-handle",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+254-759-155-650", // Add your phone number
                contactType: "customer service",
                availableLanguage: ["English", "Swahili"],
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "KE",
                addressLocality: "Nairobi", // Update with your city
              },
            }),
          }}
        />
      </head>

      <body className={inter.className}>
        {/* Google Analytics - Replace with your tracking ID */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_TRACKING_ID');
          `}
        </Script>

        {/* Google AdSense Script - moved to Script component for better loading */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1595924632810821"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1" role="main">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
