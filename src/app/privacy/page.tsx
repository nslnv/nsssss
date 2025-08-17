import Link from "next/link"
import { ArrowLeft, Mail, Phone, Shield, Lock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-line)] bg-[var(--color-bg)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-text)]">
                <ArrowLeft className="h-4 w-4" />
                Назад на сайт
              </Button>
            </Link>
            <div className="text-sm text-[var(--color-muted)]">
              Обновлено: 15 января 2024
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-[var(--font-display)] font-bold text-[var(--color-text)] mb-4">
              Политика конфиденциальности
            </h1>
            <p className="text-lg text-[var(--color-muted)] max-w-2xl mx-auto">
              Мы привержены защите вашей конфиденциальности и обеспечению безопасности ваших 
              персональных данных. Эта политика объясняет, как мы собираем, используем и защищаем вашу информацию.
            </p>
          </div>

          <div className="space-y-12">
            {/* Contact Information */}
            <Card className="card">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
                  <Mail className="h-6 w-6 text-[var(--color-primary)]" />
                  Контактная информация
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[var(--color-muted)]">
                    <Mail className="h-4 w-4" />
                    <span>niksol2000@yandex.ru</span>
                  </div>
                  <div className="flex items-center gap-3 text-[var(--color-muted)]">
                    <Phone className="h-4 w-4" />
                    <span>Telegram: @nslnv</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Какие данные мы собираем</h2>
              <Card className="card">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-[var(--color-text)] mb-3">Персональная информация</h3>
                      <ul className="space-y-2 text-[var(--color-muted)]">
                        <li>• Полное имя</li>
                        <li>• Адрес электронной почты</li>
                        <li>• Номер телефона (если предоставлен)</li>
                        <li>• Сообщения и запросы</li>
                        <li>• Информация об учебном заведении</li>
                        <li>• Детали академических проектов</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-[var(--color-text)] mb-3">Техническая информация</h3>
                      <ul className="space-y-2 text-[var(--color-muted)]">
                        <li>• IP-адрес</li>
                        <li>• Тип и версия браузера</li>
                        <li>• Операционная система</li>
                        <li>• Информация об устройстве</li>
                        <li>• Файлы cookies</li>
                        <li>• Прикрепленные файлы</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* How We Use Data */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Как мы используем ваши данные</h2>
              <Card className="card">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-3 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">Выполнение заказов</h3>
                        <p className="text-[var(--color-muted)]">
                          Мы используем вашу контактную информацию для обработки заявок, выполнения 
                          академических работ и поддержания связи по вашим проектам.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-3 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">Улучшение качества услуг</h3>
                        <p className="text-[var(--color-muted)]">
                          Ведем записи для обеспечения качества работ, соблюдения сроков и 
                          непрерывного улучшения наших услуг.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-3 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">Техническая поддержка</h3>
                        <p className="text-[var(--color-muted)]">
                          Техническая информация помогает нам обеспечивать стабильную работу сайта 
                          и улучшать пользовательский опыт.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Data Protection */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Защита данных</h2>
              <Card className="card">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock className="h-6 w-6 text-[var(--color-primary)]" />
                      </div>
                      <h3 className="font-medium text-[var(--color-text)] mb-2">Шифрование данных</h3>
                      <p className="text-sm text-[var(--color-muted)]">
                        Вся передача данных защищена SSL-шифрованием
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="h-6 w-6 text-[var(--color-primary)]" />
                      </div>
                      <h3 className="font-medium text-[var(--color-text)] mb-2">Безопасное хранение</h3>
                      <p className="text-sm text-[var(--color-muted)]">
                        Данные хранятся на защищенных серверах с ограниченным доступом
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-[var(--color-primary)]" />
                      </div>
                      <h3 className="font-medium text-[var(--color-text)] mb-2">Ограниченный доступ</h3>
                      <p className="text-sm text-[var(--color-muted)]">
                        Доступ к данным имеют только авторизованные сотрудники
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Сроки хранения данных</h2>
              <Card className="card">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-[var(--color-muted)]/5 rounded-lg">
                      <span className="font-medium text-[var(--color-text)]">Записи о заказах и коммуникации</span>
                      <span className="text-[var(--color-primary)] font-semibold">24 месяца</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-[var(--color-muted)]/5 rounded-lg">
                      <span className="font-medium text-[var(--color-text)]">Логи сайта и аналитика</span>
                      <span className="text-[var(--color-primary)] font-semibold">12 месяцев</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-[var(--color-muted)]/5 rounded-lg">
                      <span className="font-medium text-[var(--color-text)]">Прикрепленные файлы</span>
                      <span className="text-[var(--color-primary)] font-semibold">36 месяцев</span>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-muted)] mt-4">
                    Данные автоматически удаляются по истечении срока хранения, если не требуется их сохранение по закону.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Third Party Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Передача данных третьим лицам</h2>
              <Card className="card">
                <CardContent className="p-8">
                  <p className="text-[var(--color-muted)] mb-6">
                    Мы НЕ передаем ваши персональные данные третьим лицам, за исключением следующих случаев:
                  </p>
                  <div className="space-y-4">
                    <div className="border border-[var(--color-line)] rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-[var(--color-text)]">Хостинг-провайдер</h3>
                        <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded">Инфраструктура</span>
                      </div>
                      <p className="text-sm text-[var(--color-muted)]">
                        Техническое размещение сайта с соблюдением стандартов безопасности
                      </p>
                    </div>
                    <div className="border border-[var(--color-line)] rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-[var(--color-text)]">Требования закона</h3>
                        <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded">Обязательно</span>
                      </div>
                      <p className="text-sm text-[var(--color-muted)]">
                        Только по официальному запросу уполномоченных органов
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* User Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Ваши права</h2>
              <Card className="card">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-[var(--color-text)] mb-2">Доступ к данным</h3>
                        <p className="text-sm text-[var(--color-muted)]">
                          Запросить копию всех персональных данных, которые мы о вас храним
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--color-text)] mb-2">Исправление информации</h3>
                        <p className="text-sm text-[var(--color-muted)]">
                          Обновить или исправить неточную персональную информацию
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--color-text)] mb-2">Удаление данных</h3>
                        <p className="text-sm text-[var(--color-muted)]">
                          Запросить удаление ваших персональных данных
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-[var(--color-text)] mb-2">Ограничение обработки</h3>
                        <p className="text-sm text-[var(--color-muted)]">
                          Ограничить способы обработки ваших персональных данных
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--color-text)] mb-2">Переносимость данных</h3>
                        <p className="text-sm text-[var(--color-muted)]">
                          Получить ваши данные в структурированном формате
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--color-text)] mb-2">Подача жалобы</h3>
                        <p className="text-sm text-[var(--color-muted)]">
                          Обратиться в соответствующие контролирующие органы
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <div className="bg-[var(--color-primary)]/5 p-4 rounded-lg">
                    <p className="text-sm text-[var(--color-muted)]">
                      <strong className="text-[var(--color-text)]">Чтобы воспользоваться своими правами:</strong> Свяжитесь с нами по адресу niksol2000@yandex.ru 
                      или через Telegram @nslnv. Мы ответим в течение 30 дней.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Cookies Information */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Файлы Cookie</h2>
              <Card className="card">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-[var(--color-text)] mb-3">Что такое Cookie?</h3>
                      <p className="text-[var(--color-muted)]">
                        Cookie - это небольшие текстовые файлы, которые сохраняются на вашем устройстве 
                        для улучшения работы сайта и анализа посещаемости.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-[var(--color-text)] mb-3">Типы используемых Cookie</h3>
                      <ul className="space-y-2 text-[var(--color-muted)]">
                        <li>• <strong>Необходимые:</strong> Обеспечивают базовую функциональность сайта</li>
                        <li>• <strong>Аналитические:</strong> Помогают понимать, как посетители используют сайт</li>
                        <li>• <strong>Функциональные:</strong> Запоминают ваши настройки и предпочтения</li>
                      </ul>
                    </div>
                    <div className="bg-[var(--color-muted)]/5 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-[var(--color-text)] mb-3">Управление Cookie</h3>
                      <p className="text-[var(--color-muted)] mb-3">
                        Вы можете управлять и удалять cookies через настройки браузера.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Обновления политики</h2>
              <Card className="card">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-[var(--color-text)] mb-2">Как мы уведомляем об изменениях</h3>
                      <p className="text-[var(--color-muted)]">
                        При внесении изменений мы обновляем дату в верхней части политики. 
                        О значительных изменениях мы уведомляем дополнительно.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--color-text)] mb-2">Продолжение использования</h3>
                      <p className="text-[var(--color-muted)]">
                        Продолжая использовать наш сайт после изменений, вы соглашаетесь 
                        с обновленными условиями.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Связь с нами</h2>
              <Card className="card">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-medium text-[var(--color-text)] mb-4">Вопросы о конфиденциальности</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-[var(--color-primary)]" />
                          <span className="text-[var(--color-muted)]">niksol2000@yandex.ru</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-[var(--color-primary)]" />
                          <span className="text-[var(--color-muted)]">Telegram: @nslnv</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--color-text)] mb-4">Общая информация</h3>
                      <p className="text-[var(--color-muted)] text-sm">
                        Мы работаем круглосуточно и стремимся ответить на все вопросы 
                        о конфиденциальности в течение 24-48 часов.
                      </p>
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <p className="text-center text-sm text-[var(--color-muted)]">
                    Мы привержены защите вашей конфиденциальности и ответим на все запросы в течение 30 дней.
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Footer Navigation */}
          <div className="mt-12 pt-8 border-t border-[var(--color-line)] text-center">
            <Link href="/">
              <Button className="btn btn-primary">
                Вернуться на главную
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}