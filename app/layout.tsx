import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Navigation } from "@/components/Navigation"
import { CookieConsent } from "@/components/CookieConsent"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "Gaming Finder – Entdecke dein nächstes Lieblingsspiel",
  description:
    "Wähle Plattform, Genre und Preis. Wir würfeln den perfekten Titel für dich. Kostenlos und ohne Tracking.",
  generator: "v0.app",
  keywords: "Spiele, Gaming, Zufallsgenerator, Spielefinder, kostenlos",
  authors: [{ name: "Gaming Finder Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Gaming Finder – Entdecke dein nächstes Lieblingsspiel",
    description: "Wähle Plattform, Genre und Preis. Wir würfeln den perfekten Titel für dich.",
    type: "website",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaming Finder – Entdecke dein nächstes Lieblingsspiel",
    description: "Wähle Plattform, Genre und Preis. Wir würfeln den perfekten Titel für dich.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className="dark" dir="ltr">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <link rel="alternate" hrefLang="de" href="/de" />
        <link rel="alternate" hrefLang="en" href="/en" />
        <link rel="alternate" hrefLang="fr" href="/fr" />
        <link rel="alternate" hrefLang="es" href="/es" />
        <link rel="alternate" hrefLang="tr" href="/tr" />
        <link rel="alternate" hrefLang="x-default" href="/" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Navigation />
        <main role="main">{children}</main>
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  )
}
