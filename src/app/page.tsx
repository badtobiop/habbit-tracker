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

export default function LandingPage() {
  return (
    <GSAPScrollProvider>
      <div className="relative min-h-screen flex flex-col bg-cyber-950 text-white overflow-hidden">
        {/* Full-Site Atmospheric Blood Nebula Cosmic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Image
            src="/images/blood-nebula-bg.jpg"
            alt="Cosmic Blood Nebula Background"
            fill
            priority
            className="object-cover object-center filter brightness-[0.45] contrast-[1.2]"
          />
          {/* Subtle Dark Vignette & Crimson Atmospheric Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
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
        </div>
      </div>
    </GSAPScrollProvider>
  );
}
