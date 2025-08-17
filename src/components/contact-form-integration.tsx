"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone?: string;
  workType: string;
  description: string;
  source?: string;
  [key: string]: string | undefined;
}

interface FormSubmissionWrapperProps {
  children: React.ReactNode;
  fallbackMailto?: string;
  className?: string;
}

interface SubmissionResponse {
  ok: boolean;
  message?: string;
  error?: string;
  id?: number;
}

export const FormSubmissionWrapper = ({ 
  children, 
  fallbackMailto = "mailto:nslnv@example.com",
  className = ""
}: FormSubmissionWrapperProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const formsRef = useRef<HTMLFormElement[]>([]);

  // Mount protection for hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Rate limiting check (client-side)
  const isRateLimited = useCallback(() => {
    if (!isMounted || !lastSubmission) return false;
    const timeDiff = Date.now() - lastSubmission;
    const oneHour = 60 * 60 * 1000;
    return timeDiff < oneHour;
  }, [lastSubmission, isMounted]);

  // Extract form data from form element
  const extractFormData = useCallback((form: HTMLFormElement): FormData | null => {
    const formData = new FormData(form);
    const data: Partial<FormData> = {};

    // Get all form inputs
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input) => {
      const element = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const name = element.name || element.id;
      const value = element.value?.trim();

      if (name && value) {
        // Map common field variations to expected API fields
        if (name.toLowerCase().includes('email') || element.type === 'email') {
          data.email = value;
        } else if (name.toLowerCase().includes('name')) {
          data.name = value;
        } else if (name.toLowerCase().includes('phone') || element.type === 'tel') {
          data.phone = value;
        } else if (name.toLowerCase().includes('work') || name.toLowerCase().includes('service') || name.toLowerCase().includes('type')) {
          data.workType = value;
        } else if (name.toLowerCase().includes('message') || name.toLowerCase().includes('description') || name.toLowerCase().includes('comment')) {
          data.description = value;
        } else if (name.toLowerCase().includes('subject')) {
          data.workType = value;
        } else {
          // Store other fields as-is
          data[name] = value;
        }
      }
    });

    // Set defaults for required fields
    if (!data.name && (data.email || data.phone)) {
      data.name = 'Не указано';
    }
    
    if (!data.workType && data.description) {
      data.workType = 'Общий вопрос';
    }
    
    if (!data.description && data.workType) {
      data.description = 'Контакт с сайта';
    }

    // Validate required fields
    if (!data.name || !data.email || !data.workType || !data.description) {
      console.error('Missing required fields:', { data });
      return null;
    }

    data.source = window.location.pathname;

    return data as FormData;
  }, []);

  // Validate required fields
  const validateFormData = useCallback((data: FormData): string | null => {
    if (!data.name || !data.name.trim()) {
      return 'Имя обязательно для заполнения';
    }

    if (!data.email || !data.email.trim()) {
      return 'Email обязателен для заполнения';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return 'Введите корректный email адрес';
    }

    if (!data.workType || !data.workType.trim()) {
      return 'Тип работы обязателен';
    }

    if (!data.description || !data.description.trim()) {
      return 'Описание обязательно для заполнения';
    }

    return null;
  }, []);

  // Submit to API endpoint
  const submitToAPI = useCallback(async (data: FormData): Promise<SubmissionResponse> => {
    try {
      console.log('Submitting lead data:', data);
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (!response.ok) {
        console.error('API Error Response:', responseData);
        
        if (response.status === 429) {
          return {
            ok: false,
            error: 'Превышен лимит отправки. Попробуйте через час.'
          };
        }

        if (response.status === 400) {
          return {
            ok: false,
            error: responseData.error || 'Ошибка валидации данных'
          };
        }

        throw new Error(responseData.error || `HTTP ${response.status}`);
      }

      return {
        ok: true,
        message: responseData.message || 'Заявка отправлена! Я свяжусь с вами на e-mail.',
        id: responseData.id
      };

    } catch (error) {
      console.error('API submission failed:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Ошибка соединения с сервером'
      };
    }
  }, []);

  // Fallback to mailto
  const fallbackToMailto = useCallback((data: FormData) => {
    const subject = `Новая заявка: ${data.workType}`;
    const body = `
Имя: ${data.name}
Email: ${data.email}
Телефон: ${data.phone || 'Не указан'}
Тип работы: ${data.workType}

Описание:
${data.description}

---
Отправлено: ${new Date().toLocaleString('ru-RU')}
Страница: ${window.location.href}
    `.trim();

    const mailtoUrl = `${fallbackMailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  }, [fallbackMailto]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (event: Event) => {
    event.preventDefault();
    
    if (!isMounted) return;
    
    const form = event.target as HTMLFormElement;
    
    // Check rate limiting
    if (isRateLimited()) {
      toast.error('Превышен лимит отправки. Попробуйте через час.', {
        duration: 5000,
        icon: <Mail className="h-4 w-4" />,
      });
      return;
    }

    // Extract and validate form data
    const formData = extractFormData(form);
    if (!formData) {
      toast.error('Заполните все обязательные поля формы', { duration: 4000 });
      return;
    }

    const validationError = validateFormData(formData);
    if (validationError) {
      toast.error(validationError, { duration: 4000 });
      return;
    }

    setIsSubmitting(true);

    try {
      // Try API submission first
      const result = await submitToAPI(formData);

      if (result.ok) {
        // Success
        toast.success(result.message || 'Заявка отправлена! Я свяжусь с вами на e-mail.', {
          duration: 6000,
          icon: <Mail className="h-4 w-4" />,
        });
        
        // Reset form
        form.reset();
        
        // Update rate limiting timestamp
        setLastSubmission(Date.now());
        
      } else {
        // API failed, show error
        toast.error(result.error || 'Ошибка отправки заявки', {
          duration: 5000,
        });

        // If not rate limited, offer mailto fallback
        if (!result.error?.includes('лимит') && !result.error?.includes('валидации')) {
          setTimeout(() => {
            toast.info('Попробуем отправить через почтовый клиент...', {
              duration: 3000,
              action: {
                label: 'Открыть',
                onClick: () => fallbackToMailto(formData),
              },
            });
          }, 1000);
        }
      }

    } catch (error) {
      // Network or unexpected error
      console.error('Form submission error:', error);
      
      toast.error('Ошибка соединения. Попробуйте через почтовый клиент.', {
        duration: 5000,
        action: {
          label: 'Открыть почту',
          onClick: () => fallbackToMailto(formData),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isMounted, isRateLimited, extractFormData, validateFormData, submitToAPI, fallbackToMailto]);

  // Setup form listeners - only after mount
  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    // Skip forms that are managed by React (have data-managed attribute)
    const forms = containerRef.current.querySelectorAll('form:not([data-managed="true"])');
    formsRef.current = Array.from(forms);

    // Add event listeners to all unmanaged forms
    formsRef.current.forEach(form => {
      form.addEventListener('submit', handleFormSubmit);
    });

    // Cleanup
    return () => {
      formsRef.current.forEach(form => {
        form.removeEventListener('submit', handleFormSubmit);
      });
    };
  }, [handleFormSubmit, isMounted]);

  // Add loading state to forms - only after mount
  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const forms = containerRef.current.querySelectorAll('form');
    
    forms.forEach(form => {
      const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      
      submitButtons.forEach(button => {
        const btn = button as HTMLButtonElement;
        
        if (isSubmitting) {
          btn.disabled = true;
          btn.style.opacity = '0.7';
          btn.style.cursor = 'not-allowed';
          
          // Add loading spinner if it's a button element
          if (btn.tagName === 'BUTTON') {
            const originalContent = btn.innerHTML;
            btn.dataset.originalContent = originalContent;
            btn.innerHTML = `
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Отправляется...
            `;
          }
        } else {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
          
          // Restore original content
          if (btn.dataset.originalContent) {
            btn.innerHTML = btn.dataset.originalContent;
            delete btn.dataset.originalContent;
          }
        }
      });
    });
  }, [isSubmitting, isMounted]);

  // Don't render anything until mounted
  if (!isMounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={className}>
      {children}
      
      {/* Invisible loading overlay for better UX */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Отправляется...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};