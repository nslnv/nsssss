"use client"

import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar"
import ExpertHeroSection from "@/components/hero/expert-hero-section"
import ExpertAboutSection from "@/components/about/expert-about-section"
import { NumberedBadgeCards } from "@/components/feature/numbered-badge-cards"
import { MasonryTestimonialGrid } from "@/components/testimonials/masonry-testimonial-grid"
import { FAQSection } from "@/components/faq/faq-section"
import { ComprehensiveContactForm } from "@/components/contact/comprehensive-contact-form"
import { MinimalCenteredFooter } from "@/components/footers/minimal-centered-footer"
import { FormSubmissionWrapper } from "@/components/contact-form-integration"

export default function HomePage() {
  return (
    <FormSubmissionWrapper fallbackMailto="mailto:nslnv@example.com" className="min-h-screen bg-[var(--color-bg)] relative">
      {/* Навигация */}
      <header className="z-ui sticky top-0 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-line)]">
        <AnimatedIndicatorNavbar />
      </header>

      {/* Основной контент */}
      <main className="content-layer">
        {/* Hero Section */}
        <section id="hero" className="section">
          <ExpertHeroSection />
        </section>

        {/* About Section */}
        <section id="about" className="section-tight">
          <ExpertAboutSection />
        </section>

        {/* Services Section */}
        <section id="services" className="section-tight">
          <NumberedBadgeCards />
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="section-tight">
          <MasonryTestimonialGrid />
        </section>

        {/* FAQ Section */}
        <section id="faq" className="section-tight">
          <FAQSection />
        </section>

        {/* Contact Section */}
        <section id="contact" className="section">
          <ComprehensiveContactForm />
        </section>
      </main>

      {/* Футер - статический, не перекрывает контент */}
      <footer className="content-layer">
        <MinimalCenteredFooter />
      </footer>

      {/* Фоновая декорация - не перехватывает клики */}
      <div className="decoration fixed inset-0 overflow-hidden">
        {/* Мягкие градиентные орбы */}
        <div 
          className="decoration absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--color-primary) 0%, var(--color-accent) 50%, transparent 70%)',
          }}
        />
        
        <div 
          className="decoration absolute bottom-1/3 left-1/5 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, var(--color-accent) 0%, var(--color-primary-600) 40%, transparent 70%)',
          }}
        />
      </div>
    </FormSubmissionWrapper>
  )
}