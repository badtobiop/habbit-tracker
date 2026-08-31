import React from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/landing/Navbar';
import { GSAPScrollProvider } from '@/components/landing/GSAPScrollProvider';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { AnimeShowcaseSection } from '@/components/landing/AnimeShowcaseSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';
import { AmbientMusicPlayer } from '@/components/common/AmbientMusicPlayer';
import { IntroSplashLoader } from '@/components/common/IntroSplashLoader';

export default function LandingPage() {
  return (
    <GSAPScrollProvider>
      {/* Ultra-Fast (<1s) Pure Black Spinning Moon Intro Loader */}
      <IntroSplashLoader />

      <div className="relative min-h-screen flex flex-col bg-cyber-950 text-white overflow-hidden">
        {/* Full-Site Atmospheric Mountain & Bioluminescent Shoreline Ocean Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Image
            src="/images/lunar-mountain-ocean-bg.jpg"
            alt="Mountain Shoreline Ocean and Starry Sky"
            fill
            priority
            className="object-cover object-center filter brightness-[0.75] contrast-[1.12]"
          />
          {/* Subtle Oceanic Dark Vignette Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#040814]/65 via-[#040814]/35 to-[#040814]/80 pointer-events-none" />
        </div>

        {/* Foreground Page Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <HeroSection />

            <div className="gsap-slide-left">
              <FeaturesSection />
            </div>

            <div className="gsap-slide-right">
              <HowItWorksSection />
            </div>

            <div className="gsap-slide-left">
              <AnimeShowcaseSection />
            </div>

            <div className="gsap-slide-right">
              <PricingSection />
            </div>

            <div className="gsap-reveal">
              <FAQSection />
            </div>
          </main>
          <Footer />

          {/* Floating Ambient Music & Soundscape Player */}
          <AmbientMusicPlayer />
        </div>
      </div>
    </GSAPScrollProvider>
  );
}
