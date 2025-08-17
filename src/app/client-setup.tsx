"use client";

import { useEffect, useState } from "react";

export const ClientSetup = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // 1. Обработка visualViewport для мобильных клавиатур
    if (typeof window !== 'undefined' && window.visualViewport) {
      const handleViewportResize = () => {
        document.body.style.setProperty('--vvh', window.visualViewport!.height + 'px');
      };
      
      window.visualViewport.addEventListener('resize', handleViewportResize);
      handleViewportResize(); // Инициализация
      
      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleViewportResize);
        }
      };
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    // 2. Делегирование кликов с защитой от пустых ссылок
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const clickable = target.closest('a, button, [data-action]');
      
      if (!clickable) return;
      
      // Защита от пустых ссылок
      if (clickable.tagName === 'A') {
        const href = clickable.getAttribute('href') || '';
        if (!href || href === '#' || clickable.hasAttribute('disabled')) {
          e.preventDefault();
          return;
        }
      }
    };

    document.addEventListener('click', handleGlobalClick, { passive: true });
    
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    // 3. Плавная прокрутка к полям формы при фокусе
    const handleFormFieldFocus = (e: FocusEvent) => {
      const target = e.target as Element;
      if (target.id === 'workType' || target.id === 'description' || target.matches('input, select, textarea')) {
        target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    };

    document.addEventListener('focus', handleFormFieldFocus, { capture: true, passive: true });
    
    return () => {
      document.removeEventListener('focus', handleFormFieldFocus, { capture: true });
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    // 4. Диагностика перекрытий по Alt+D (только в dev режиме)
    if (process.env.NODE_ENV === 'development') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.altKey && e.key === 'd') {
          e.preventDefault();
          
          // Находим все positioned элементы
          const positioned = document.querySelectorAll('[style*="position"], [class*="fixed"], [class*="absolute"], [class*="sticky"]');
          
          positioned.forEach((el) => {
            const computedStyle = window.getComputedStyle(el);
            const position = computedStyle.position;
            const zIndex = computedStyle.zIndex;
            
            if (position !== 'static') {
              // Добавляем временную подсветку
              const overlay = document.createElement('div');
              overlay.style.cssText = `
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                border: 2px solid #ff0080;
                background: rgba(255,0,128,0.1);
                pointer-events: none;
                z-index: 999999;
                font-family: monospace;
                font-size: 12px;
                color: #ff0080;
                padding: 4px;
              `;
              overlay.textContent = `${position} z:${zIndex}`;
              
              if (el.style.position === 'relative') {
                el.appendChild(overlay);
              } else {
                el.style.position = 'relative';
                el.appendChild(overlay);
              }
              
              // Убираем через 3 секунды
              setTimeout(() => {
                overlay.remove();
              }, 3000);
            }
          });
          
          console.log('🔍 Диагностика перекрытий:', positioned.length, 'positioned элементов');
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isMounted]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return null;
};