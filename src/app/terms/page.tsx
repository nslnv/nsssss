import Link from 'next/link'
import { ArrowLeft, GraduationCap, Shield, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-sm border-b border-[var(--color-line)]">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="gap-2 hover:bg-accent text-[var(--color-muted)] hover:text-[var(--color-text)]">
              <ArrowLeft className="h-4 w-4" />
              Назад на главную
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="p-8 md:p-12 card">
          {/* Header */}
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-[var(--font-display)] font-bold text-[var(--color-text)] mb-4">
              Условия использования
            </h1>
            <p className="text-[var(--color-muted)] text-lg">
              Действует с: 15 января 2024 г.
            </p>
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-10">
              <p className="text-lg text-[var(--color-text)] leading-relaxed mb-6">
                Добро пожаловать на наш сайт академических услуг. Используя этот сайт, вы соглашаетесь 
                с данными условиями использования. Эти условия регулируют ваше взаимодействие с нашим 
                сайтом и услугами по написанию академических работ.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-6 border-b border-[var(--color-line)] pb-2 flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-[var(--color-primary)]" />
                1. Описание услуг
              </h2>
              <div className="space-y-4 text-[var(--color-text)]/90">
                <p>
                  Наш сайт предоставляет профессиональные услуги по написанию академических работ, включая:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="list-disc">• Курсовые работы по различным дисциплинам</li>
                  <li className="list-disc">• Дипломные и выпускные квалификационные работы</li>
                  <li className="list-disc">• Рефераты, эссе и статьи</li>
                  <li className="list-disc">• Диссертации и научные исследования</li>
                  <li className="list-disc">• Консультации по академическим вопросам</li>
                  <li className="list-disc">• Помощь в подготовке к защите работ</li>
                </ul>
                <p>
                  Все работы выполняются индивидуально, с учетом требований учебных заведений 
                  и пожеланий клиентов.
                </p>
              </div>
            </section>

            {/* User Obligations */}
            <section className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-6 border-b border-[var(--color-line)] pb-2 flex items-center gap-3">
                <Shield className="h-8 w-8 text-[var(--color-primary)]" />
                2. Обязательства сторон
              </h2>
              <div className="space-y-4 text-[var(--color-text)]/90">
                <h3 className="text-xl font-medium text-[var(--color-text)]">Обязательства клиента:</h3>
                <ul className="space-y-2 ml-6">
                  <li className="list-disc">• Предоставлять точную и полную информацию о требованиях к работе</li>
                  <li className="list-disc">• Своевременно вносить оплату согласованной стоимости</li>
                  <li className="list-disc">• Уважать интеллектуальную собственность автора</li>
                  <li className="list-disc">• Использовать готовые работы в соответствии с этическими нормами</li>
                  <li className="list-disc">• Предоставлять методические материалы и требования ВУЗа</li>
                  <li className="list-disc">• Соблюдать конфиденциальность полученной информации</li>
                </ul>
                
                <h3 className="text-xl font-medium text-[var(--color-text)] mt-6">Наши обязательства:</h3>
                <ul className="space-y-2 ml-6">
                  <li className="list-disc">• Выполнять работы качественно и в оговоренные сроки</li>
                  <li className="list-disc">• Обеспечивать уникальность текста (антиплагиат)</li>
                  <li className="list-disc">• Соблюдать полную конфиденциальность заказов</li>
                  <li className="list-disc">• Предоставлять бесплатные доработки в рамках ТЗ</li>
                  <li className="list-disc">• Консультировать по вопросам выполненной работы</li>
                  <li className="list-disc">• Быть доступными для связи круглосуточно</li>
                </ul>
              </div>
            </section>

            {/* Payment Terms */}
            <section className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-6 border-b border-[var(--color-line)] pb-2 flex items-center gap-3">
                <Clock className="h-8 w-8 text-[var(--color-primary)]" />
                3. Условия оплаты и сроки
              </h2>
              <div className="space-y-4 text-[var(--color-text)]/90">
                <p>
                  <strong>Ценообразование:</strong> Стоимость работ рассчитывается индивидуально 
                  в зависимости от сложности, объема, сроков выполнения и требований.
                </p>
                
                <p>
                  <strong>Способы оплаты:</strong> Принимаем оплату удобными для вас способами - 
                  банковские карты, электронные кошельки, банковские переводы.
                </p>

                <p>
                  <strong>Сроки выполнения:</strong> Сроки согласовываются при оформлении заказа 
                  и зависят от типа и сложности работы. Стандартные сроки:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="list-disc">• Рефераты, эссе: 1-3 дня</li>
                  <li className="list-disc">• Курсовые работы: 5-10 дней</li>
                  <li className="list-disc">• Дипломные работы: 14-30 дней</li>
                  <li className="list-disc">• Срочные заказы: по договоренности с доплатой</li>
                </ul>

                <p>
                  <strong>Политика возврата:</strong> Возврат средств возможен только в случае 
                  невыполнения работы в оговоренные сроки по нашей вине или при кардинальном 
                  несоответствии техническому заданию.
                </p>
              </div>
            </section>

            {/* Quality Guarantees */}
            <section className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-6 border-b border-[var(--color-line)] pb-2 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-[var(--color-primary)]" />
                4. Гарантии качества
              </h2>
              <div className="space-y-4 text-[var(--color-text)]/90">
                <p>
                  <strong>Гарантия уникальности:</strong> Все работы проходят проверку на уникальность. 
                  Процент оригинальности не менее 70% (или по требованиям ВУЗа).
                </p>

                <p>
                  <strong>Академические стандарты:</strong> Работы выполняются в соответствии с требованиями 
                  ГОСТ, методическими указаниями ВУЗов и академическими стандартами.
                </p>

                <p>
                  <strong>Бесплатные доработки:</strong> В течение 30 дней после сдачи работы предоставляем 
                  бесплатные доработки в рамках первоначального технического задания.
                </p>

                <p>
                  <strong>Консультационная поддержка:</strong> Предоставляем консультации по готовой работе 
                  для успешной защиты перед преподавателем.
                </p>

                <div className="bg-[var(--color-success)]/10 p-4 rounded-lg border border-[var(--color-success)]/20">
                  <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">Наши гарантии:</h3>
                  <ul className="space-y-1 text-sm text-[var(--color-text)]/90">
                    <li>✓ Соблюдение оговоренных сроков</li>
                    <li>✓ Качество работ на высоком академическом уровне</li>
                    <li>✓ Полная конфиденциальность</li>
                    <li>✓ Круглосуточная поддержка</li>
                    <li>✓ Индивидуальный подход к каждому заказу</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-6 border-b border-[var(--color-line)] pb-2">
                5. Интеллектуальная собственность
              </h2>
              <div className="space-y-4 text-[var(--color-text)]/90">
                <p>
                  <strong>Права на выполненные работы:</strong> После полной оплаты права на использование 
                  академической работы переходят к заказчику для личного использования в образовательных целях.
                </p>

                <p>
                  <strong>Авторские права:</strong> Все материалы, созданные в процессе выполнения заказа, 
                  являются оригинальными. Мы гарантируем отсутствие нарушений авторских прав третьих лиц.
                </p>

                <p>
                  <strong>Использование работ:</strong> Готовые работы предназначены для:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="list-disc">• Изучения структуры и методологии исследования</li>
                  <li className="list-disc">• Подготовки к экзаменам и защите</li>
                  <li className="list-disc">• Получения консультаций по теме</li>
                  <li className="list-disc">• Использования в качестве образца</li>
                </ul>

                <p className="text-sm bg-[var(--color-muted)]/10 p-3 rounded-lg">
                  <strong>Важно:</strong> Заказчик несет ответственность за этичное использование 
                  предоставленных материалов в соответствии с правилами своего учебного заведения.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-6 border-b border-[var(--color-line)] pb-2">
                6. Ограничение ответственности
              </h2>
              <div className="space-y-4 text-[var(--color-text)]/90">
                <p>
                  <strong>Академическая ответственность:</strong> Мы не несем ответственности за последствия 
                  использования наших работ в учебном процессе. Решение о способе использования материалов 
                  принимает исключительно заказчик.
                </p>
                
                <p>
                  <strong>Технические ограничения:</strong> Не несем ответственности за:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="list-disc">• Временные сбои в работе сайта</li>
                  <li className="list-disc">• Проблемы с интернет-соединением пользователя</li>
                  <li className="list-disc">• Потерю данных при передаче файлов</li>
                  <li className="list-disc">• Действия третьих лиц</li>
                </ul>

                <p>
                  <strong>Форс-мажор:</strong> В случае форс-мажорных обстоятельств (стихийные бедствия, 
                  технические сбои провайдеров и т.д.) сроки выполнения могут быть скорректированы 
                  по взаимному согласию сторон.
                </p>

                <p>
                  <strong>Ограничение возмещения:</strong> Наша общая ответственность не может превышать 
                  стоимость конкретного заказа, по которому возник спор.
                </p>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-6 border-b border-[var(--color-line)] pb-2">
                7. Разрешение споров
              </h2>
              <div className="space-y-4 text-[var(--color-text)]/90">
                <p>
                  <strong>Процедура урегулирования:</strong> Все споры решаются в следующем порядке:
                </p>
                <ol className="space-y-2 ml-6">
                  <li className="list-decimal">Прямые переговоры между сторонами</li>
                  <li className="list-decimal">Письменное изложение претензий</li>
                  <li className="list-decimal">Поиск компромиссного решения</li>
                  <li className="list-decimal">При необходимости - привлечение медиатора</li>
                  <li className="list-decimal">Обращение в компетентные органы</li>
                </ol>

                <p>
                  <strong>Сроки рассмотрения:</strong> Все претензии и споры рассматриваются в течение 
                  3-7 рабочих дней с момента получения письменного обращения.
                </p>

                <p>
                  <strong>Документооборот:</strong> Рекомендуем сохранять всю переписку и документы, 
                  связанные с выполнением заказа, для возможного урегулирования спорных ситуаций.
                </p>
              </div>
            </section>

            {/* Confidentiality */}
            <section className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-6 border-b border-[var(--color-line)] pb-2">
                8. Конфиденциальность
              </h2>
              <div className="space-y-4 text-[var(--color-text)]/90">
                <p>
                  <strong>Защита персональных данных:</strong> Мы обязуемся защищать конфиденциальность 
                  всех клиентов и не разглашать информацию о заказах третьим лицам.
                </p>

                <p>
                  <strong>Анонимность:</strong> Все заказы выполняются с соблюдением полной анонимности. 
                  Мы не храним данные об учебных заведениях клиентов и преподавателях.
                </p>

                <p>
                  <strong>Безопасность данных:</strong> Вся передача файлов и коммуникация осуществляется 
                  по защищенным каналам связи с применением современных методов шифрования.
                </p>

                <p className="text-sm">
                  Подробнее о защите персональных данных читайте в нашей 
                  <Link href="/privacy" className="text-[var(--color-primary)] hover:underline ml-1">
                    Политике конфиденциальности
                  </Link>
                </p>
              </div>
            </section>

            {/* Term Modifications */}
            <section className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-6 border-b border-[var(--color-line)] pb-2">
                9. Изменения условий
              </h2>
              <div className="space-y-4 text-[var(--color-text)]/90">
                <p>
                  <strong>Право на изменения:</strong> Мы оставляем за собой право изменять данные условия 
                  для отражения изменений в наших услугах, правовых требованиях или деловых практиках.
                </p>

                <p>
                  <strong>Уведомление об изменениях:</strong> О существенных изменениях мы уведомляем через:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="list-disc">• Уведомления на сайте</li>
                  <li className="list-disc">• Email-рассылку зарегистрированным пользователям</li>
                  <li className="list-disc">• Обновление даты вступления в силу</li>
                </ul>

                <p>
                  <strong>Принятие изменений:</strong> Продолжение использования сайта после внесения 
                  изменений означает согласие с новыми условиями.
                </p>

                <p>
                  <strong>Архив версий:</strong> Предыдущие версии условий доступны по запросу 
                  для ознакомления и сравнения изменений.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-6 border-b border-[var(--color-line)] pb-2">
                10. Применимое право
              </h2>
              <div className="space-y-4 text-[var(--color-text)]/90">
                <p>
                  <strong>Юрисдикция:</strong> Данные условия использования регулируются законодательством 
                  Российской Федерации, независимо от коллизионных норм права.
                </p>

                <p>
                  <strong>Международные пользователи:</strong> При использовании сайта из других стран 
                  пользователи несут ответственность за соблюдение местного законодательства.
                </p>

                <p>
                  <strong>Подсудность:</strong> Все споры, которые не могут быть решены путем переговоров, 
                  подлежат рассмотрению в компетентных судах РФ.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mt-12 p-6 bg-[var(--color-primary)]/5 rounded-lg border border-[var(--color-primary)]/10">
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Вопросы по условиям использования?
              </h3>
              <div className="space-y-2 text-[var(--color-text)]/90">
                <p>
                  📧 Email: niksol2000@yandex.ru
                </p>
                <p>
                  📱 Telegram: @nslnv
                </p>
                <p>
                  ⏰ Время работы: круглосуточно
                </p>
              </div>
              <p className="text-sm text-[var(--color-muted)] mt-4">
                Последнее обновление: 15 января 2024 г. • Версия 1.0
              </p>
            </section>
          </div>
        </Card>
      </main>
    </div>
  )
}