"use client";

// Global click handler utility with event delegation and accessibility features
// Provides unified handling for scroll-to-section, external links, modals, and keyboard navigation

type ClickHandlerOptions = {
  headerOffset?: number;
  scrollDuration?: number;
  enableKeyboardNavigation?: boolean;
  enableFocusTrapping?: boolean;
};

type FocusTrapElement = HTMLElement & {
  _focusTrap?: {
    previousActiveElement: Element | null;
    firstFocusableElement: HTMLElement | null;
    lastFocusableElement: HTMLElement | null;
    isTrapping: boolean;
  };
};

const DEFAULT_OPTIONS: ClickHandlerOptions = {
  headerOffset: 80,
  scrollDuration: 800,
  enableKeyboardNavigation: true,
  enableFocusTrapping: true,
};

let globalOptions: ClickHandlerOptions = { ...DEFAULT_OPTIONS };
let isInitialized = false;
let activeModal: FocusTrapElement | null = null;
let lastClickTime = 0;
let clickCount = 0;

// Rate limiting to prevent spam clicking
const RATE_LIMIT_MS = 300;
const MAX_CLICKS_PER_PERIOD = 5;

// Focusable elements selector
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input[type="text"]:not([disabled])',
  'input[type="email"]:not([disabled])',
  'input[type="tel"]:not([disabled])',
  'input[type="radio"]:not([disabled])',
  'input[type="checkbox"]:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ');

// Utility functions
export const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  if (url === '#' || url === 'javascript:void(0)') return false;
  return true;
};

export const isExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
};

export const isHashLink = (url: string): boolean => {
  return url.startsWith('#') && url.length > 1;
};

export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(container.querySelectorAll(FOCUSABLE_ELEMENTS)) as HTMLElement[];
};

// Rate limiting for clicks
const isRateLimited = (): boolean => {
  const now = Date.now();
  
  if (now - lastClickTime > RATE_LIMIT_MS) {
    clickCount = 0;
  }
  
  if (clickCount >= MAX_CLICKS_PER_PERIOD) {
    return true;
  }
  
  clickCount++;
  lastClickTime = now;
  return false;
};

// Center element into view (для workType и description)
const centerIntoView = (element: HTMLElement): void => {
  element.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
};

// Smooth scroll to section with header offset
export const scrollToSection = (
  targetId: string, 
  options: Partial<ClickHandlerOptions> = {}
): Promise<void> => {
  return new Promise((resolve) => {
    const mergedOptions = { ...globalOptions, ...options };
    const target = document.getElementById(targetId.replace('#', ''));
    
    if (!target) {
      console.warn(`Element with ID "${targetId}" not found`);
      resolve();
      return;
    }

    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = targetPosition - (mergedOptions.headerOffset || 0);
    
    // Use native smooth scroll if supported, otherwise use custom animation
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Estimate scroll completion time
      setTimeout(() => resolve(), mergedOptions.scrollDuration || 800);
    } else {
      // Custom smooth scroll animation for older browsers
      const startPosition = window.pageYOffset;
      const distance = offsetPosition - startPosition;
      const duration = mergedOptions.scrollDuration || 800;
      let startTime: number | null = null;

      const animateScroll = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function (ease-out-cubic)
        const ease = 1 - Math.pow(1 - progress, 3);
        
        window.scrollTo(0, startPosition + (distance * ease));

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animateScroll);
    }

    // Update focus for accessibility
    setTimeout(() => {
      target.focus({ preventScroll: true });
      target.setAttribute('tabindex', '-1');
    }, mergedOptions.scrollDuration || 800);
  });
};

// Focus trap implementation for modals
export const focusTrap = {
  enable: (element: HTMLElement): void => {
    if (!globalOptions.enableFocusTrapping) return;
    
    const trapElement = element as FocusTrapElement;
    const focusableElements = getFocusableElements(trapElement);
    
    if (focusableElements.length === 0) return;

    // Store current active element
    trapElement._focusTrap = {
      previousActiveElement: document.activeElement,
      firstFocusableElement: focusableElements[0],
      lastFocusableElement: focusableElements[focusableElements.length - 1],
      isTrapping: true
    };

    // Set initial focus
    trapElement._focusTrap.firstFocusableElement?.focus();
    activeModal = trapElement;

    // Handle tab navigation
    const handleTabKey = (e: KeyboardEvent) => {
      if (!trapElement._focusTrap?.isTrapping) return;
      
      const { firstFocusableElement, lastFocusableElement } = trapElement._focusTrap;
      
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement?.focus();
          }
        }
      }
    };

    trapElement.addEventListener('keydown', handleTabKey);
  },

  disable: (element: HTMLElement): void => {
    const trapElement = element as FocusTrapElement;
    
    if (!trapElement._focusTrap?.isTrapping) return;

    trapElement._focusTrap.isTrapping = false;
    
    // Restore focus to previous element
    if (trapElement._focusTrap.previousActiveElement instanceof HTMLElement) {
      trapElement._focusTrap.previousActiveElement.focus();
    }

    activeModal = null;
    trapElement._focusTrap = undefined;
  }
};

// Handle different types of click actions
const handleLinkClick = (element: HTMLAnchorElement, event: Event): boolean => {
  const href = element.getAttribute('href');
  
  if (!isValidUrl(href || '')) {
    event.preventDefault();
    return false;
  }

  // Handle hash links (scroll to section)
  if (isHashLink(href || '')) {
    event.preventDefault();
    scrollToSection(href || '');
    return false;
  }

  // Handle external links
  if (isExternalUrl(href || '')) {
    if (!element.hasAttribute('target')) {
      element.setAttribute('target', '_blank');
    }
    if (!element.hasAttribute('rel')) {
      element.setAttribute('rel', 'noopener noreferrer');
    }
  }

  return true;
};

const handleDataAction = (element: HTMLElement, action: string, event: Event): boolean => {
  switch (action) {
    case 'scroll-to':
      const href = element.getAttribute('href');
      if (href && isHashLink(href)) {
        event.preventDefault();
        const id = href.split('#')[1];
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      break;

    case 'close-modal':
      const modal = element.closest('[data-modal]') as HTMLElement;
      if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        focusTrap.disable(modal);
      }
      break;

    case 'open-modal':
      const targetModal = document.querySelector(
        `[data-modal="${element.dataset.target}"]`
      ) as HTMLElement;
      if (targetModal) {
        targetModal.style.display = 'block';
        targetModal.setAttribute('aria-hidden', 'false');
        focusTrap.enable(targetModal);
      }
      break;

    case 'toggle-dropdown':
      const dropdown = element.nextElementSibling as HTMLElement;
      if (dropdown) {
        const isOpen = dropdown.style.display !== 'none';
        dropdown.style.display = isOpen ? 'none' : 'block';
        element.setAttribute('aria-expanded', (!isOpen).toString());
      }
      break;

    case 'copy-text':
      const textToCopy = element.dataset.copyText || element.textContent || '';
      navigator.clipboard?.writeText(textToCopy).then(() => {
        // Add visual feedback
        const originalText = element.textContent;
        element.textContent = 'Copied!';
        setTimeout(() => {
          element.textContent = originalText;
        }, 2000);
      });
      break;

    default:
      console.warn(`Unknown data-action: ${action}`);
      return true;
  }

  event.preventDefault();
  return false;
};

// Main click handler with event delegation - согласно ТЗ
const globalClickHandler = (event: Event): void => {
  // Rate limiting check
  if (isRateLimited()) {
    event.preventDefault();
    return;
  }

  const target = event.target as HTMLElement;
  if (!target) return;

  // Find the actual clickable element (supports event bubbling)
  const clickableElement = target.closest('a, button, [data-action]') as HTMLElement;
  if (!clickableElement) return;

  // Check for disabled elements
  if (clickableElement.hasAttribute('disabled') || clickableElement.getAttribute('aria-disabled') === 'true') {
    event.preventDefault();
    return;
  }

  // Handle data-action attributes first
  const dataAction = clickableElement.dataset.action;
  if (dataAction) {
    handleDataAction(clickableElement, dataAction, event);
    return;
  }

  // Handle anchor links - проверка пустых ссылок согласно ТЗ
  if (clickableElement.tagName === 'A') {
    const href = clickableElement.getAttribute('href') || '';
    if (!href || href === '#' || clickableElement.hasAttribute('disabled')) {
      event.preventDefault();
      return;
    }
    handleLinkClick(clickableElement as HTMLAnchorElement, event);
    return;
  }

  // Handle button clicks (let them proceed normally unless they have special handling)
  if (clickableElement.tagName === 'BUTTON') {
    // Check for form submission prevention on invalid forms
    const form = clickableElement.closest('form');
    if (form && clickableElement.getAttribute('type') === 'submit') {
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
      }
    }
  }
};

// Keyboard event handler
const globalKeyboardHandler = (event: KeyboardEvent): void => {
  if (!globalOptions.enableKeyboardNavigation) return;

  switch (event.key) {
    case 'Escape':
      // Close active modal
      if (activeModal) {
        activeModal.style.display = 'none';
        activeModal.setAttribute('aria-hidden', 'true');
        focusTrap.disable(activeModal);
      }
      
      // Close any open dropdowns
      document.querySelectorAll('[aria-expanded="true"]').forEach(element => {
        element.setAttribute('aria-expanded', 'false');
        const dropdown = element.nextElementSibling as HTMLElement;
        if (dropdown) {
          dropdown.style.display = 'none';
        }
      });
      break;

    case 'Enter':
    case ' ':
      // Handle space/enter on focusable elements that aren't naturally clickable
      const target = event.target as HTMLElement;
      if (target && target.dataset.action && target.tagName !== 'BUTTON' && target.tagName !== 'A') {
        event.preventDefault();
        target.click();
      }
      break;
  }
};

// Visual Viewport API support for mobile keyboards
const setupVisualViewportHandler = (): (() => void) => {
  if (!window.visualViewport) {
    return () => {};
  }

  const handleViewportResize = () => {
    document.body.style.setProperty('--vvh', window.visualViewport!.height + 'px');
  };

  window.visualViewport.addEventListener('resize', handleViewportResize);
  
  // Initial setup
  handleViewportResize();

  return () => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleViewportResize);
    }
  };
};

// Focus management for workType and description fields
const setupFocusHandlers = (): (() => void) => {
  const focusHandlers: { element: HTMLElement; handler: () => void }[] = [];

  const setupFieldFocus = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const handler = () => centerIntoView(element);
      element.addEventListener('focus', handler);
      focusHandlers.push({ element, handler });
    }
  };

  // Setup focus handlers for workType and description
  setupFieldFocus('workType');
  setupFieldFocus('description');

  return () => {
    focusHandlers.forEach(({ element, handler }) => {
      element.removeEventListener('focus', handler);
    });
  };
};

// Initialize global click handler with event delegation
export const setupGlobalClickHandler = (options: Partial<ClickHandlerOptions> = {}): void => {
  if (isInitialized) {
    console.warn('Global click handler is already initialized');
    return;
  }

  globalOptions = { ...DEFAULT_OPTIONS, ...options };

  // Add passive event listeners where appropriate - ВСЕ passive: true согласно ТЗ
  document.addEventListener('click', globalClickHandler, { passive: false }); // Нужен false для preventDefault
  
  if (globalOptions.enableKeyboardNavigation) {
    document.addEventListener('keydown', globalKeyboardHandler, { passive: false }); // Нужен false для preventDefault
  }

  // Passive listeners для производительности
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.addEventListener('touchmove', () => {}, { passive: true });
  document.addEventListener('wheel', () => {}, { passive: true });

  // Setup visual viewport and focus handlers
  const cleanupViewport = setupVisualViewportHandler();
  const cleanupFocus = setupFocusHandlers();

  // Store cleanup functions
  (window as any).__clickHandlerCleanup = () => {
    cleanupViewport();
    cleanupFocus();
  };

  // Handle focus management for better accessibility
  document.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement;
    if (target && target.dataset.action) {
      target.setAttribute('tabindex', '0');
    }
  }, { passive: true });

  // Initialize ARIA attributes for interactive elements
  document.querySelectorAll('[data-action]').forEach(element => {
    if (!element.hasAttribute('role') && element.tagName !== 'BUTTON' && element.tagName !== 'A') {
      element.setAttribute('role', 'button');
    }
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
  });

  isInitialized = true;
  console.log('Global click handler initialized with options:', globalOptions);
};

// Cleanup function
export const destroyGlobalClickHandler = (): void => {
  if (!isInitialized) return;

  document.removeEventListener('click', globalClickHandler);
  document.removeEventListener('keydown', globalKeyboardHandler);

  // Call stored cleanup functions
  if ((window as any).__clickHandlerCleanup) {
    (window as any).__clickHandlerCleanup();
    delete (window as any).__clickHandlerCleanup;
  }

  // Disable any active focus traps
  if (activeModal) {
    focusTrap.disable(activeModal);
  }

  isInitialized = false;
  console.log('Global click handler destroyed');
};

// Utility function to update options after initialization
export const updateGlobalClickHandlerOptions = (options: Partial<ClickHandlerOptions>): void => {
  globalOptions = { ...globalOptions, ...options };
  console.log('Global click handler options updated:', globalOptions);
};

// Export additional utilities
export const clickHandlerUtils = {
  isValidUrl,
  isExternalUrl,
  isHashLink,
  getFocusableElements,
  scrollToSection,
  focusTrap,
  setupGlobalClickHandler,
  destroyGlobalClickHandler,
  updateGlobalClickHandlerOptions
};

export default setupGlobalClickHandler;