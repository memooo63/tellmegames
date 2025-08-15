import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Header } from "@/components/Header"
import { CookieConsent } from "@/components/CookieConsent"
import { Toaster } from "@/components/ui/toaster"
import { cookies } from "next/headers"
import "./globals.css"

export const metadata: Metadata = {
  title: "tellmenext.games – Entdecke dein nächstes Lieblingsspiel",
  description:
    "Wähle Plattform, Genre und Preis. Wir würfeln den perfekten Titel für dich. Kostenlos und ohne Tracking.",
  generator: "v0.app",
  keywords: "Spiele, Gaming, Zufallsgenerator, Spielefinder, kostenlos",
  authors: [{ name: "tellmenext.games" }],
  robots: "index, follow",
  openGraph: {
    title: "tellmenext.games – Entdecke dein nächstes Lieblingsspiel",
    description: "Wähle Plattform, Genre und Preis. Wir würfeln den perfekten Titel für dich.",
    type: "website",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "tellmenext.games – Entdecke dein nächstes Lieblingsspiel",
    description: "Wähle Plattform, Genre und Preis. Wir würfeln den perfekten Titel für dich.",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const theme = cookieStore.get("theme")?.value === "light" ? "light" : "dark"
  const lang = cookieStore.get("lang")?.value || "de"

  return (
    <html lang={lang} className={theme} dir="ltr">
      <head>
        <style>{`html { font-family: ${GeistSans.style.fontFamily}; --font-sans: ${GeistSans.variable}; --font-mono: ${GeistMono.variable}; }`}</style>
        <link rel="alternate" hrefLang="de" href="/" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Header />
        <main role="main">{children}</main>
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  )
}
