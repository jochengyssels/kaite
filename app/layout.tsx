import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kiteaways Spot Finder",
  description: "Find the best wind conditions for kiteboarding",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark"> {/* Remove 'dark' here if using ThemeToggle */}
      <body
        className={`${inter.className} bg-[var(--color-background)] text-[var(--color-foreground)] transition-colors duration-300`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
