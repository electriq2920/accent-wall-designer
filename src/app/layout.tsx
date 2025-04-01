import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css'
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | DIYify',
    default: 'DIYify - Custom Moulding & Pattern Templates',
  },
  description: 'Create custom accent walls with professional 3D visualization and exact measurements',
  keywords: 'DIYify, accent wall patterns, moulding designs, 3D wall visualizer, wall design tool, DIY accent wall, wainscoting, custom wall design',
  authors: [{ name: 'DIYify' }],
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    type: 'website',
    title: 'DIYify - Create Custom Wall Patterns',
    description: 'Design beautiful accent walls with realistic 3D previews and detailed measurement plans',
    siteName: 'DIYify',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DIYify Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DIYify - Free Online Design Tool',
    description: 'Create professional accent walls with our easy-to-use design tool',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://accentwalldesigner.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Preconnect to font and image domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        
        {/* Structured data for SEO */}
        <Script id="schema-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "DIYify",
            "url": "https://accentwalldesigner.com",
            "applicationCategory": "DesignApplication",
            "genre": "interior design",
            "description": "Create custom accent walls with our free 3D designer tool. Visualize patterns, get exact measurements, and export detailed plans.",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "screenshot": "https://accentwalldesigner.com/app-preview.jpg",
            "featureList": "3D visualization, custom moulding patterns, measurements calculator, PDF export"
          }
        `}} />
        
        <footer className="bg-gray-100 py-6 mt-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">© {new Date().getFullYear()} DIYify. All rights reserved.</p>
              </div>
              <div className="mt-4 md:mt-0">
                <nav className="flex space-x-4">
                  <a href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">Privacy Policy</a>
                  <a href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">Terms of Use</a>
                  <a href="/contact" className="text-gray-600 hover:text-gray-900 text-sm">Contact</a>
                </nav>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
