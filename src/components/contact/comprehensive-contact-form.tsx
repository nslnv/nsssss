"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, Mail, Clock, Send, Check, ArrowRight, Upload, FileText, X, Calendar } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ComprehensiveContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    workType: '',
    description: '',
    deadline: '',
    budget: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fillStartTime, setFillStartTime] = useState<number | null>(null);
  const [honeypot, setHoneypot] = useState(''); // Скрытое поле-приманка

  // Таймер заполнения формы ≥ 3 сек для антиспама
  useEffect(() => {
    if (fillStartTime === null && (formData.name || formData.email || formData.description)) {
      setFillStartTime(Date.now());
    }
  }, [formData, fillStartTime]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      workType: '',
      description: '',
      deadline: '',
      budget: ''
    });
    setSelectedFiles([]);
    setFillStartTime(null);
    setHoneypot('');
  };

  // Валидация email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Валидация телефона - международный формат
  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true; // Телефон не обязателен
    const phoneRegex = /^\+?\d[\d\s\-()]{7,}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  // Обработка выбора файлов (множественный)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const validFiles: File[] = [];
    
    for (const file of files) {
      // Проверка размера файла (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Файл "${file.name}" слишком большой. Максимальный размер: 10MB`);
        continue;
      }

      // Проверка типа файла
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'application/zip'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(`Файл "${file.name}" не поддерживается. Разрешены: PDF, DOC, DOCX, TXT, JPG, PNG, ZIP`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast.success(`Выбрано файлов: ${validFiles.length}`);
    }
  };

  // Удаление конкретного файла
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Антиспам проверки
    if (honeypot) {
      console.log('Spam detected (honeypot filled)');
      return;
    }

    const fillDuration = fillStartTime ? (Date.now() - fillStartTime) / 1000 : 0;
    if (fillDuration < 3) {
      toast.error('Пожалуйста, заполните форму более внимательно');
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Пожалуйста, введите ваше имя');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Пожалуйста, введите ваш email');
      return;
    }

    if (!formData.workType.trim()) {
      toast.error('Пожалуйста, выберите тип работы');
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      toast.error('Пожалуйста, опишите вашу задачу (минимум 10 символов)');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Пожалуйста, введите корректный email адрес');
      return;
    }

    if (formData.phone.trim() && !validatePhone(formData.phone)) {
      toast.error('Пожалуйста, введите корректный номер телефона');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload files first if present
      if (selectedFiles.length > 0) {
        toast.info('Загружаем файлы...');
        setUploadingFiles(true);
        const fileFormData = new FormData();
        
        selectedFiles.forEach(file => {
          fileFormData.append('files', file);
        });
        
        const fileResponse = await fetch('/api/leads/upload', {
          method: 'POST',
          body: fileFormData,
        });

        if (!fileResponse.ok) {
          const fileError = await fileResponse.json();
          toast.error(`Ошибка загрузки файлов: ${fileError.error || 'Неизвестная ошибка'}`);
          return;
        }

        const fileResult = await fileResponse.json();
        console.log('Files upload result:', fileResult);
        setUploadingFiles(false);
      }

      // Prepare lead data
      const leadPayload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        workType: formData.workType,
        description: formData.description.trim(),
        deadline: formData.deadline || undefined,
        budget: formData.budget || undefined,
        source: 'website',
        honeypot: honeypot
      };

      // Submit lead to the API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadPayload),
      });

      const responseData = await response.json();

      if (response.ok && responseData.ok) {
        setIsSubmitted(true);
        toast.success('Заявка принята! Свяжусь с вами в ближайшее время.');
        
        if ('vibrate' in navigator) {
          navigator.vibrate(20);
        }
        
        setTimeout(() => {
          setIsSubmitted(false);
          resetForm();
        }, 4000);
      } else {
        const errorMessage = responseData.error || 'Ошибка отправки заявки';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Ошибка отправки формы:', error);
      toast.error('Ошибка сети. Пожалуйста, проверьте подключение и попробуйте снова.');
    } finally {
      setIsSubmitting(false);
      setUploadingFiles(false);
    }
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Telegram",
      value: "@nslnv",
      href: "https://t.me/nslnv",
      description: "Быстрый ответ в течение часа"
    },
    {
      icon: Mail,
      title: "Email", 
      value: "niksol2000@yandex.ru",
      href: "mailto:niksol2000@yandex.ru",
      description: "Подробная консультация"
    },
    {
      icon: Clock,
      title: "Время работы",
      value: "Круглосуточно",
      href: null,
      description: "Всегда на связи"
    }
  ];

  return (
    <section className="section bg-[var(--color-bg)] form-container content-layer">
      <div className="container">
        <div className="mb-12 text-center">
          <h1 className="text-[var(--text-h2)] font-[var(--font-display)] text-[var(--color-text)] mb-4">
            Контакты
          </h1>
          <p className="text-[var(--color-muted)] max-w-2xl mx-auto">
            Готов помочь с вашей работой. Свяжитесь со мной любым удобным способом
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-6">
            {contactMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <div
                  key={method.title}
                  className={`flex items-start gap-4 p-4 rounded-[var(--radius)] card transition-all duration-200 ${
                    method.href ? 'cursor-pointer hover:shadow-lg' : ''
                  }`}
                  onClick={() => method.href && window.open(method.href, '_blank', 'noopener,noreferrer')}
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-[var(--color-primary)]/10">
                    <IconComponent className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-[var(--color-text)]">
                      {method.title}
                    </p>
                    <p className="text-[var(--color-muted)]">
                      {method.value}
                    </p>
                    <p className="text-xs text-[var(--color-muted)] mt-1">
                      {method.description}
                    </p>
                  </div>
                  {method.href && (
                    <ArrowRight className="h-4 w-4 text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              );
            })}

            {/* Online Chat Widget */}
            <div className="mt-8 card">
              <div className="flex items-center gap-3 mb-4">
                <Send className="h-5 w-5 text-[var(--color-primary)]" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Онлайн чат
                </h3>
              </div>
              <p className="text-[var(--color-muted)] mb-6">
                Напишите мне прямо сейчас для быстрой консультации. Отвечаю в течение часа!
              </p>
              <Button 
                onClick={() => window.open('https://t.me/nslnv', '_blank', 'noopener,noreferrer')}
                className="btn btn-primary w-full"
              >
                Начать чат в Telegram
                <MessageCircle className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Order Form */}
          <div className="content-layer">
            {/* Форма заказа с полным фоном */}
            <div className="bg-[var(--color-card)] border border-[var(--color-line)] rounded-[var(--radius)] p-6 shadow-[var(--shadow)]">
              {/* Заголовок формы с иконкой */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-line)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center">
                  <Send className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">
                  Форма заказа
                </h2>
              </div>
              
              {/* Скрытое поле-приманка для антиспама */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none', pointerEvents: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />
              
              {isSubmitted ? (
                <div className="text-center py-12 px-6 bg-[var(--color-success)]/10 rounded-[var(--radius)] border border-[var(--color-success)]/20">
                  <Check className="w-12 h-12 text-[var(--color-success)] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[var(--color-success)] mb-2">Заявка принята!</h3>
                  <p className="text-[var(--color-muted)] mb-4">Свяжусь с вами в ближайшее время</p>
                  <p className="text-sm text-[var(--color-muted)]">Форма будет сброшена автоматически</p>
                </div>
              ) : (
                <form className="space-y-6 content-layer" data-managed="true" onSubmit={handleSubmit}>
                  {/* Секция личной информации */}
                  <div className="bg-[var(--color-bg-weak)] rounded-[var(--radius)] p-4">
                    <h3 className="text-base font-medium text-[var(--color-text)] mb-4 flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-[var(--color-primary)]/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-[var(--color-primary)]">1</span>
                      </div>
                      Личная информация
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Имя */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm text-[var(--color-text)] font-medium">
                          Ваше имя *
                        </Label>
                        <Input 
                          id="name"
                          name="name"
                          placeholder="Введите ваше имя"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="h-12 bg-white"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm text-[var(--color-text)] font-medium">
                          Email *
                        </Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Введите ваш email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="h-12 bg-white"
                        />
                      </div>

                      {/* Телефон */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm text-[var(--color-text)] font-medium">
                          Телефон
                        </Label>
                        <Input 
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+7 (999) 123-45-67"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={isSubmitting}
                          className="h-12 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Секция деталей заказа */}
                  <div className="bg-[var(--color-bg-weak)] rounded-[var(--radius)] p-4">
                    <h3 className="text-base font-medium text-[var(--color-text)] mb-4 flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-[var(--color-primary)]/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-[var(--color-primary)]">2</span>
                      </div>
                      Детали заказа
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Тип работы */}
                      <div className="space-y-2">
                        <Label htmlFor="workType" className="text-sm text-[var(--color-text)] font-medium">
                          Тип работы *
                        </Label>
                        <Select 
                          value={formData.workType}
                          onValueChange={(value) => handleInputChange('workType', value)} 
                          disabled={isSubmitting}
                          required
                        >
                          <SelectTrigger id="workType" name="workType" className="h-12 bg-white">
                            <SelectValue placeholder="Выберите тип работы" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Курсовая работа">Курсовая работа</SelectItem>
                            <SelectItem value="Дипломная работа">Дипломная работа</SelectItem>
                            <SelectItem value="Юридическая работа">Юридическая работа</SelectItem>
                            <SelectItem value="Педагогическая работа">Педагогическая работа</SelectItem>
                            <SelectItem value="IT работа">IT работа</SelectItem>
                            <SelectItem value="Гуманитарная работа">Гуманитарная работа</SelectItem>
                            <SelectItem value="Веб-разработка">Веб-разработка</SelectItem>
                            <SelectItem value="Дизайн">Дизайн</SelectItem>
                            <SelectItem value="Консультация">Консультация</SelectItem>
                            <SelectItem value="Обучение">Обучение</SelectItem>
                            <SelectItem value="Мобильные приложения">Мобильные приложения</SelectItem>
                            <SelectItem value="SEO">SEO</SelectItem>
                            <SelectItem value="Контент-маркетинг">Контент-маркетинг</SelectItem>
                            <SelectItem value="Брендинг">Брендинг</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                            <SelectItem value="Автоматизация">Автоматизация</SelectItem>
                            <SelectItem value="Другое">Другое</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Описание задания */}
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm text-[var(--color-text)] font-medium">
                          Описание задания *
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Опишите детали задания: тему, объем, требования, методические указания и т.д."
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="min-h-[100px] resize-vertical bg-white"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Дедлайн и Бюджет в одной строке */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Дедлайн */}
                        <div className="space-y-2">
                          <Label htmlFor="deadline" className="text-sm text-[var(--color-text)] font-medium">
                            Дедлайн
                          </Label>
                          <div className="relative">
                            <Input 
                              id="deadline"
                              name="deadline"
                              type="date"
                              placeholder="дд.мм.гггг"
                              value={formData.deadline}
                              onChange={(e) => handleInputChange('deadline', e.target.value)}
                              disabled={isSubmitting}
                              className="h-12 bg-white"
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
                          </div>
                        </div>

                        {/* Предполагаемый бюджет */}
                        <div className="space-y-2">
                          <Label htmlFor="budget" className="text-sm text-[var(--color-text)] font-medium">
                            Предполагаемый бюджет (₽)
                          </Label>
                          <Input 
                            id="budget"
                            name="budget"
                            type="text"
                            placeholder="Укажите желаемую сумму"
                            value={formData.budget}
                            onChange={(e) => handleInputChange('budget', e.target.value)}
                            disabled={isSubmitting}
                            className="h-12 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Секция файлов */}
                  <div className="bg-[var(--color-bg-weak)] rounded-[var(--radius)] p-4">
                    <h3 className="text-sm text-[var(--color-text)] font-medium mb-4 flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-[var(--color-primary)]/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-[var(--color-primary)]">3</span>
                      </div>
                      Прикрепить файлы
                    </h3>
                    
                    {selectedFiles.length === 0 ? (
                      <div className="space-y-2">
                        <input
                          id="file-upload"
                          type="file"
                          onChange={handleFileSelect}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          className="hidden"
                          disabled={isSubmitting || uploadingFiles}
                          multiple
                        />
                        <div 
                          onClick={() => document.getElementById('file-upload')?.click()}
                          className="border-2 border-dashed border-[var(--color-line)] rounded-lg p-8 text-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors bg-white"
                        >
                          <Upload className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-3" />
                          <p className="text-[var(--color-text)] font-medium mb-2">
                            Выберите файлы
                          </p>
                          <p className="text-sm text-[var(--color-muted)]">
                            Поддерживается: PDF, DOC, DOCX, TXT, JPG, PNG (макс. 10МБ каждый)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border border-[var(--color-line)] rounded-lg bg-white">
                            <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                            <div className="flex-1">
                              <div className="font-medium text-[var(--color-text)] text-sm">
                                {file.name}
                              </div>
                              <div className="text-xs text-[var(--color-muted)]">
                                {(file.size / 1024 / 1024).toFixed(2)} МБ
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              disabled={isSubmitting || uploadingFiles}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {/* Кнопка для добавления еще файлов */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={isSubmitting || uploadingFiles}
                          className="w-full h-10"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Добавить еще файлы
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="pt-6">
                    <Button 
                      size="lg" 
                      type="submit" 
                      disabled={isSubmitting || uploadingFiles}
                      className="btn btn-primary w-full h-12 flex items-center gap-2 font-medium"
                    >
                      {isSubmitting ? 'Отправка заявки...' : uploadingFiles ? 'Загрузка файлов...' : 'Отправить заказ'}
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom guarantee section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 card">
            <div className="p-2 rounded-lg bg-[var(--color-success)]/20">
              <Check className="w-5 w-5 text-[var(--color-success)]" />
            </div>
            <div className="text-left">
              <div className="font-medium text-[var(--color-text)]">
                Гарантия качества и соблюдения сроков
              </div>
              <div className="text-sm text-[var(--color-muted)]">
                Бесплатные доработки до полного соответствия требованиям
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ComprehensiveContactForm };