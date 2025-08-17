"use client";

import { ExternalLink, Star, Users, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MasonryTestimonialGrid = () => {
  const reviewPlatforms = [
    {
      name: "StudWork",
      url: "https://studwork.ru/info/564376",
      rating: "4.9/5",
      reviews: "1200+",
      icon: Star,
      description: "Высокие оценки за качество работ",
      isTop: true
    },
    {
      name: "StudLance", 
      url: "https://studlance.ru/studlancer/278929",
      rating: "5.0/5",
      reviews: "50+",
      icon: Users,
      description: "Довольные клиенты и позитивные отзывы",
      isTop: false
    },
    {
      name: "Avito",
      url: "https://www.avito.ru/moskva/predlozheniya_uslug/pomosch_studentam_i_repetitorskie_uslugi_4476019116",
      rating: "4.8/5", 
      reviews: "30+",
      icon: Award,
      description: "Проверенный исполнитель с гарантиями",
      isTop: false
    }
  ];

  return (
    <section className="section-tight bg-[var(--color-bg)]">
      <div className="container">
        {/* Title Section */}
        <div className="mb-12 text-center">
          <h2 className="text-[var(--text-h2)] font-[var(--font-display)] text-[var(--color-text)] mb-4">
            Отзывы студентов
          </h2>
          
          <p className="text-[var(--color-muted)] max-w-3xl mx-auto mb-6">
            Более 1000 довольных клиентов. Посмотрите отзывы обо мне на популярных платформах и убедитесь в качестве моих услуг:
          </p>

          {/* Stats showcase */}
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {[
              { label: "Довольных клиентов", value: "1000+" },
              { label: "Средняя оценка", value: "4.9★" },
              { label: "Сдача с первого раза", value: "98%" }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-[var(--color-primary)]">
                  {stat.value}
                </div>
                <div className="text-xs text-[var(--color-muted)] uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviewPlatforms.map((platform, idx) => {
            const IconComponent = platform.icon;
            return (
              <Card key={idx} className="card hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--color-text)]">
                          {platform.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                          <span className="font-medium text-[var(--color-primary)]">{platform.rating}</span>
                          <span>•</span>
                          <span>{platform.reviews} отзывов</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating badge - only show TOP for StudWork */}
                    {platform.isTop && (
                      <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-full text-xs font-medium">
                        TOP
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-6 flex-grow">
                    {platform.description}
                  </p>

                  {/* CTA Button */}
                  <Button 
                    onClick={() => window.open(platform.url, '_blank', 'noopener,noreferrer')}
                    className="btn btn-primary w-full flex items-center gap-2"
                  >
                    Смотреть отзывы
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 card">
            <Star className="w-5 h-5 text-[var(--color-primary)]" />
            <div className="text-left">
              <div className="font-medium text-[var(--color-text)]">
                Готовы присоединиться к довольным клиентам?
              </div>
              <div className="text-sm text-[var(--color-muted)]">
                Начните сотрудничество уже сегодня
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { MasonryTestimonialGrid };