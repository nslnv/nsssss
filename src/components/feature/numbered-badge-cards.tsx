"use client";

import { Scale, GraduationCap, Code2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataItem {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DATA: DataItem[] = [
  {
    id: 1,
    title: "Юридические",
    description:
      "Профессиональная помощь в изучении правовых дисциплин, конституционного, гражданского, уголовного права и процессуальных отраслей.",
    icon: Scale,
  },
  {
    id: 2,
    title: "Педагогические",
    description:
      "Экспертная поддержка в области образовательных наук, методики преподавания и современных педагогических технологий.",
    icon: GraduationCap,
  },
  {
    id: 3,
    title: "IT и технические",
    description:
      "Квалифицированное сопровождение в освоении программирования, информационных технологий и технических дисциплин.",
    icon: Code2,
  },
  {
    id: 4,
    title: "Гуманитарные",
    description:
      "Глубокое понимание гуманитарных наук: литературы, истории, философии, социологии и культурологии.",
    icon: BookOpen,
  },
];

const NumberedBadgeCards = () => {
  // Scroll to contact section
  const scrollToContact = () => {
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
    <section className="section-tight bg-[var(--color-bg)]">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-[var(--text-h2)] font-[var(--font-display)] text-[var(--color-text)] mb-4">
            Услуги
          </h2>
          <p className="text-[var(--color-muted)] max-w-2xl mx-auto">
            Профессиональная экспертная поддержка в широком спектре академических дисциплин
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {DATA.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="card group hover:shadow-lg transition-all duration-200"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="p-3 rounded-full bg-[var(--color-primary)] text-white">
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="mb-3 text-lg font-semibold font-[var(--font-display)] text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  {service.title}
                </h3>

                <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-4">
                  {service.description}
                </p>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={scrollToContact}
                  className="btn btn-outline w-full text-sm"
                >
                  Заказать работу
                </Button>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-block card">
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              Не нашли нужную специализацию?
            </h3>
            <p className="text-[var(--color-muted)] mb-6">
              Свяжитесь со мной для обсуждения индивидуального решения
            </p>
            <Button 
              size="lg"
              onClick={scrollToContact}
              className="btn btn-primary"
            >
              Связаться со мной
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { NumberedBadgeCards };