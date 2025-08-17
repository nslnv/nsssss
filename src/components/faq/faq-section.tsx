"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Какие виды работ вы выполняете?",
    answer: "Выполняю курсовые, дипломные работы, диссертации, отчеты, эссе, рефераты и другие академические работы. Специализируюсь на юридических, педагогических, IT и гуманитарных дисциплинах. Каждая работа выполняется с учетом специфики предмета и требований учебного заведения."
  },
  {
    question: "Как формируется стоимость и какие способы оплаты?",
    answer: "Стоимость зависит от типа работы, объема, сложности и срочности. Принимаю оплату через банковские карты, электронные кошельки и банковские переводы. Предоставляю честную оценку стоимости без скрытых доплат. Возможна частичная предоплата для крупных проектов."
  },
  {
    question: "Можете ли выполнить срочный заказ?",
    answer: "Да, принимаю срочные заказы от 1-2 дней в зависимости от сложности работы. Для небольших заданий возможно выполнение в течение нескольких часов. Срочность может повлиять на стоимость, но качество работы остается на высоком уровне."
  },
  {
    question: "Какие гарантии качества вы предоставляете?",
    answer: "Гарантирую 100% уникальность текста, соблюдение всех требований и ГОСТов. Каждая работа проходит проверку на плагиат и соответствие академическим стандартам. При необходимости предоставляю бесплатные доработки до полного соответствия требованиям."
  },
  {
    question: "Что входит в политику доработок?",
    answer: "Предоставляю бесплатные доработки в течение 14 дней после сдачи работы (30 дней для дипломных). Доработки должны соответствовать первоначальным требованиям. Если доработки кардинально меняют суть работы, это обсуждается отдельно."
  },
  {
    question: "Как обеспечивается конфиденциальность?",
    answer: "Полная конфиденциальность гарантирована. Ваши личные данные и информация о заказе не передаются третьим лицам. Все материалы работы удаляются после завершения проекта. Работаю без посредников, что обеспечивает максимальную приватность."
  },
  {
    question: "Как происходит процесс работы и общения?",
    answer: "Общение ведется через Telegram или email. Обсуждаем требования, уточняем детали, согласуем сроки. В процессе выполнения предоставляю промежуточные результаты и отчеты о ходе работы. Вы всегда можете связаться со мной для уточнений."
  },
  {
    question: "Как обеспечивается уникальность работы?",
    answer: "Каждая работа пишется с нуля специально для вас. Использую только актуальные источники и правильно оформляю все цитаты и ссылки. Проверяю готовую работу на плагиат с помощью профессиональных систем. Предоставляю отчет об уникальности по запросу."
  }
];

export const FAQSection = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleItem(index);
    }
  };

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
    <section className="section-tight content-layer">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-[var(--text-h2)] font-[var(--font-display)] text-[var(--color-text)] mb-4">
            Частые вопросы
          </h2>
          <p className="text-[var(--color-muted)] max-w-2xl mx-auto">
            Ответы на популярные вопросы о процессе работы, гарантиях и условиях сотрудничества.
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((item, index) => {
            const isOpen = openItems.includes(index);
            
            return (
              <div
                key={index}
                className="card overflow-hidden transition-all duration-200 hover:shadow-lg"
              >
                <button
                  onClick={() => toggleItem(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full tap-target px-6 py-4 text-left flex items-center justify-between bg-transparent border-0 cursor-pointer transition-colors duration-200 hover:bg-[var(--color-bg-weak)] content-layer"
                >
                  <span className="text-lg font-semibold text-[var(--color-text)] pr-4 leading-tight">
                    {item.question}
                  </span>
                  <ChevronDown 
                    className={`w-6 h-6 text-[var(--color-primary)] transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                
                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen 
                      ? 'max-h-[500px] opacity-100' 
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-4">
                    <div className="h-px bg-[var(--color-line)] mb-4"></div>
                    <p className="text-[var(--color-text)] leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="card">
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">
              Остались вопросы?
            </h3>
            <p className="text-[var(--color-muted)] mb-6">
              Свяжитесь со мной для получения подробной консультации по вашему проекту.
            </p>
            <button 
              onClick={scrollToContact}
              className="btn btn-primary"
            >
              Связаться со мной
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};