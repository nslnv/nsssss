"use client";

import { Clock, Shield, CheckCircle, FileCheck, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const advantages = [
  {
    icon: Clock,
    title: "Соблюдение сроков",
    description: "Гарантируем выполнение работы точно в срок без задержек"
  },
  {
    icon: Shield,
    title: "Конфиденциальность",
    description: "Полная анонимность и защита ваших персональных данных"
  },
  {
    icon: CheckCircle,
    title: "По ГОСТ",
    description: "Строгое соответствие всем академическим требованиям и стандартам"
  },
  {
    icon: FileCheck,
    title: "Анти-плагиат",
    description: "Оригинальный контент с высокой уникальностью текста"
  },
  {
    icon: Headphones,
    title: "Поддержка 24/7",
    description: "Круглосуточная техническая поддержка и консультации"
  }
];

export const AdvantagesSection = () => {
  return (
    <section className="section-tight py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Наши преимущества
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Качественное выполнение работ с соблюдением всех требований
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            
            return (
              <Card 
                key={index}
                className="group relative overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cozy-shadow cozy-shadow-hover transform hover:-translate-y-1 cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={`${advantage.title}: ${advantage.description}`}
              >
                <CardContent className="p-6 text-center h-full flex flex-col min-h-[200px] justify-between">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/10 rounded-full transform scale-0 group-hover:scale-110 transition-transform duration-300" />
                      <div className="relative z-10 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                        <Icon 
                          className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" 
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {advantage.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mt-4 group-hover:text-foreground/80 transition-colors duration-300">
                    {advantage.description}
                  </p>

                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">
              Более 5000 довольных клиентов
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};