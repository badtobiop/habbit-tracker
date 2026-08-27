import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { ToastProvider } from '@/components/common/ToastContext';
import { AnimeParticles } from '@/components/common/AnimeParticles';

export const metadata: Metadata = {
  title: 'Uchiha Habit Tracker | Sharingan Discipline Protocol',
  description:
    'Build habits, maintain streaks, track progress on real-time calendars, and awaken Uchiha Clan ranks, spirit familiars, and legendary achievements. Lifetime access for only ₹49.',
  keywords: ['uchiha habit tracker', 'productivity', 'habits', 'streaks', 'sharingan', 'gamified habits'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body
        className="bg-cyber-950 text-slate-100 min-h-screen antialiased flex flex-col relative selection:bg-red-600 selection:text-white"
        suppressHydrationWarning
      >
        <ToastProvider>
          <AnimeParticles />
          <div className="relative z-10 flex-1 flex flex-col">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
