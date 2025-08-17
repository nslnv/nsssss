"use client"

import { Check, Star, Award } from "lucide-react"

export default function ExpertAboutSection() {
  const stats = [
    { number: "2000+", label: "выполненных проектов" },
    { number: "5", label: "лет опыта" },
    { number: "98%", label: "сдача с первого раза" }
  ]

  const specializations = [
    "Юридические дисциплины",
    "Педагогические науки", 
    "IT и программирование",
    "Гуманитарные предметы",
    "Экономика и менеджмент",
    "Психология и социология"
  ]

  const achievements = [
    "Кандидат наук по специальности",
    "Опыт преподавания в ВУЗе",
    "Автор 15+ научных публикаций",
    "Участник международных конференций"
  ]

  return (
    <section className="section-tight bg-[var(--color-bg)]">
      <div className="container">
        <div className="mb-12">
          <h2 className="text-[var(--text-h2)] font-[var(--font-display)] text-[var(--color-text)] mb-6">
            Обо мне
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-7">
            <div className="space-y-6">
              <div className="text-lg text-[var(--color-text)] leading-relaxed">
                За годы работы я помог сотням студентов успешно защитить свои дипломные, курсовые и научные работы. Мой подход основан на глубоком понимании академических требований и индивидуальных потребностей каждого студента.
              </div>

              <div className="space-y-4">
                <p className="text-[var(--color-muted)] leading-relaxed">
                  Специализируюсь на создании качественных академических работ, которые не только соответствуют всем требованиям, но и демонстрируют глубокое понимание предмета. Каждая работа проходит тщательную проверку на уникальность и соответствие стандартам.
                </p>

                <p className="text-[var(--color-muted)] leading-relaxed">
                  Мой опыт охватывает широкий спектр дисциплин, что позволяет мне находить междисциплинарные подходы к решению сложных академических задач.
                </p>
              </div>

              {/* Achievements */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[var(--color-text)]">
                  Достижения
                </h3>
                <div className="grid gap-3">
                  {achievements.map((achievement, index) => (
                    <div
                      key={achievement}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius)] card"
                    >
                      <div className="w-5 h-5 bg-[var(--color-primary)] rounded-sm flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[var(--color-muted)]">
                        {achievement}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Specializations */}
          <div className="lg:col-span-5 space-y-8">
            {/* Statistics */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[var(--color-text)]">
                Статистика
              </h3>
              <div className="grid gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="card"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-[var(--color-primary)]">
                          {stat.number}
                        </div>
                        <div className="text-xs text-[var(--color-muted)] uppercase tracking-wide mt-1">
                          {stat.label}
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="w-full h-px bg-[var(--color-line)]" />

            {/* Specializations */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[var(--color-text)]">
                Специализации
              </h3>
              <div className="space-y-3">
                {specializations.map((spec, index) => (
                  <div
                    key={spec}
                    className="flex items-center gap-3 py-2"
                  >
                    <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full flex-shrink-0" />
                    <span className="text-[var(--color-muted)]">
                      {spec}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="w-full h-1 bg-[var(--color-primary)] rounded-full" />
          </div>
        </div>
      </div>
    </section>
  )
}