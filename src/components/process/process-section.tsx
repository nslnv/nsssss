import React from 'react';
import { Send, Search, FileCheck, Headphones, ArrowRight } from 'lucide-react';

const ProcessSection = () => {
  const steps = [
    {
      id: 1,
      icon: Send,
      title: 'Заявка',
      description: 'Отправляете заявку с требованиями к работе и желаемыми сроками выполнения'
    },
    {
      id: 2,
      icon: Search,
      title: 'Оценка',
      description: 'Анализирую задачу и предоставляю точную оценку стоимости и сроков'
    },
    {
      id: 3,
      icon: FileCheck,
      title: 'Договор/оплата',
      description: 'Заключаем договор, обговариваем детали и производим оплату'
    },
    {
      id: 4,
      icon: Headphones,
      title: 'Сдача/поддержка',
      description: 'Сдаю готовую работу в срок и предоставляю поддержку при необходимости'
    }
  ];

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
    <section className="section-tight">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-[var(--text-h2)] font-[var(--font-display)] text-[var(--color-text)] mb-4">
            Процесс работы
          </h2>
          <p className="text-[var(--color-muted)] max-w-2xl mx-auto">
            Простой и прозрачный процесс сотрудничества от заявки до результата
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-20 left-0 w-full h-0.5 bg-[var(--color-line)] z-0" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-content">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              
              return (
                <div key={step.id} className="relative">
                  <div className="card group hover:shadow-lg transition-all duration-200 text-center h-full flex flex-col">
                    {/* Step Number */}
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-sm mb-4 mx-auto relative z-content">
                      {step.id}
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center mb-4 mx-auto group-hover:bg-[var(--color-primary)]/20 transition-colors duration-200">
                      <IconComponent className="w-8 h-8 text-[var(--color-primary)]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">
                        {step.title}
                      </h3>
                      <p className="text-[var(--color-muted)] text-sm leading-relaxed flex-1">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Arrow */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-20 z-content">
                      <ArrowRight className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                  )}

                  {/* Mobile Arrow */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-4 mb-2">
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[var(--color-primary)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-[var(--color-muted)] mb-6">
            Готовы начать работу над вашим проектом?
          </p>
          <button 
            onClick={scrollToContact}
            className="btn btn-primary flex items-center gap-2 mx-auto"
          >
            <Send className="w-4 h-4" />
            Оставить заявку
          </button>
        </div>
      </div>
    </section>
  );
};

export { ProcessSection };