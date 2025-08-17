"use client";

import { Send, Mail, ExternalLink } from "lucide-react";

const MinimalCenteredFooter = () => {
  const navigation = [
    { name: "Главная", href: "#hero" },
    { name: "Услуги", href: "#services" },
    { name: "Отзывы", href: "#testimonials" },
    { name: "Контакты", href: "#contact" },
  ];

  const social = [
    { 
      name: "Telegram", 
      href: "https://t.me/nslnv", 
      icon: Send,
      description: "Быстрый ответ"
    },
    { 
      name: "Email", 
      href: "mailto:niksol2000@yandex.ru", 
      icon: Mail,
      description: "Подробная консультация"
    },
  ];

  const legal = [
    { name: "Политика конфиденциальности", href: "/privacy" },
    { name: "Условия использования", href: "/terms" },
  ];

  // Smooth scroll function
  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <footer className="bg-[var(--color-bg)] border-t border-[var(--color-line)] content-layer">
      <div className="container">
        {/* Main footer content */}
        <div className="py-12">
          {/* Top row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h3 className="text-xl font-[var(--font-display)] font-bold text-[var(--color-text)]">
                NSLNV EXPERT
              </h3>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Академические работы любой сложности
              </p>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 flex justify-center">
              <ul className="flex flex-wrap items-center justify-center gap-1 text-sm">
                {navigation.map((item, index) => (
                  <li key={item.name} className="flex items-center">
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(item.href);
                      }}
                      className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors duration-200 px-3 py-2 rounded-lg cursor-pointer tap-target"
                    >
                      {item.name}
                    </a>
                    {index < navigation.length - 1 && (
                      <span className="text-[var(--color-muted)] opacity-50">•</span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Social links */}
            <div className="flex-shrink-0">
              <ul className="flex items-center gap-4">
                {social.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-all duration-200 group p-3 rounded-lg card tap-target"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon className="w-4 h-4" />
                        <div className="hidden sm:block">
                          <div className="text-xs font-medium">{item.name}</div>
                          <div className="text-xs opacity-60">{item.description}</div>
                        </div>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[var(--color-line)] mb-6" />

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
            {/* Copyright */}
            <div className="text-[var(--color-muted)]">
              © 2024 NSLNV Expert. Все права защищены
            </div>

            {/* Legal links */}
            <div className="flex items-center gap-1">
              {legal.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <a
                    href={item.href}
                    className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors duration-200 px-2 py-1 rounded tap-target"
                  >
                    {item.name}
                  </a>
                  {index < legal.length - 1 && (
                    <span className="text-[var(--color-muted)] mx-2 opacity-50">•</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 card">
              <Send className="w-5 h-5 text-[var(--color-primary)]" />
              <div className="text-left">
                <div className="font-medium text-[var(--color-text)]">
                  Нужна помощь с академической работой?
                </div>
                <div className="text-sm text-[var(--color-muted)]">
                  Свяжитесь со мной прямо сейчас
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="decoration absolute inset-0 opacity-5 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10" />
    </footer>
  );
};

export { MinimalCenteredFooter };