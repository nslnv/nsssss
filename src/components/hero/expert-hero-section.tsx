"use client";

import { ChevronRight, Bot } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ExpertHeroSection() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToContact = () => {
    if (!isMounted) return;
    
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      const offset = 80;
      const elementPosition = contactSection.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="section bg-[var(--color-bg)] relative">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[80dvh]">
          {/* Left - Content */}
          <div className="space-y-6">
            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="font-[var(--font-display)] text-[var(--color-text)] leading-tight text-[var(--text-h1)]">
                НИКИТА
              </h1>
              <div className="flex items-center gap-4">
                <div className="h-0.5 w-16 bg-[var(--color-primary)]" />
                <span className="text-[var(--text-h2)] font-[var(--font-display)] text-[var(--color-primary)] font-normal">
                  NSLNV_HELP
                </span>
              </div>
            </div>

            {/* Slogan */}
            <div className="space-y-3">
              <h2 className="text-[var(--text-h3)] font-medium text-[var(--color-text)]">
                Эксперт по академическим работам
              </h2>
              <div className="w-20 h-1 rounded-full bg-[var(--color-primary)]" />
            </div>

            {/* Description */}
            <div className="space-y-4 max-w-lg">
              <p className="text-[var(--color-muted)] leading-relaxed">
                Специализируюсь на выполнении курсовых, дипломных работ и диссертаций 
                в области юриспруденции, педагогики, IT и гуманитарных наук.
              </p>

              {/* AI Assistant Button */}
              <Link href="/nslnv-ai">
                <div className="p-6 rounded-[var(--radius)] card hover:card-hover transition-all duration-200 cursor-pointer border border-[var(--color-primary)]/20 bg-gradient-to-r from-[var(--color-card)] to-[var(--color-card)]/80">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">
                        Некит Нейронов
                      </h3>
                      <p className="text-sm text-[var(--color-muted)]">
                        Твой бесплатный помощник по учебе
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                </div>
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={scrollToContact}
                className="btn btn-primary flex items-center gap-3"
              >
                Заказать работу
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <a
                href="https://t.me/nslnv"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline flex items-center gap-3"
              >
                Telegram
              </a>
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-80 h-96 lg:w-96 lg:h-[500px] card overflow-hidden">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1755303946226-gwc6g4u7l.jpeg"
                alt="Никита NSLNV - Эксперт по академическим работам"
                fill
                className="object-cover"
                priority 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="decoration absolute top-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10 bg-[var(--color-primary)]" />
      <div className="decoration absolute bottom-1/3 left-1/5 w-60 h-60 rounded-full blur-3xl opacity-8 bg-[var(--color-accent)]" />
    </section>
  );
}