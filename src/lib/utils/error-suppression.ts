"use client";

import { useEffect, useCallback } from 'react';

/**
 * Original handlers storage for cleanup
 */
interface OriginalHandlers {
  consoleError: typeof console.error;
  errorHandler?: (event: ErrorEvent) => void;
  rejectionHandler?: (event: PromiseRejectionEvent) => void;
}

/**
 * Debounce function to prevent excessive error handling
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

/**
 * Check if an error message is related to ResizeObserver
 * @param message Error message to check
 * @returns True if the error is ResizeObserver-related
 */
function isResizeObserverError(message: string): boolean {
  const resizeObserverPatterns = [
    /ResizeObserver loop completed with undelivered notifications/i,
    /ResizeObserver loop limit exceeded/i,
    /ResizeObserver callback error/i,
    /Non-finite result in ResizeObserver/i,
    /ResizeObserver timeout/i,
    /ResizeObserver.*error/i,
  ];
  
  return resizeObserverPatterns.some(pattern => pattern.test(message));
}

/**
 * Configuration options for error suppression
 */
export interface ErrorSuppressionConfig {
  /** Debounce delay for error handling in milliseconds */
  debounceDelay?: number;
  /** Whether to log suppressed errors to a different method */
  logSuppressed?: boolean;
  /** Custom logger for suppressed errors */
  suppressedLogger?: (message: string, ...args: any[]) => void;
}

/**
 * Cleanup function type
 */
export type CleanupFunction = () => void;

/**
 * Suppresses ResizeObserver errors by overriding console.error and adding
 * window error handlers. Only targets specific ResizeObserver error patterns
 * while allowing other legitimate errors to pass through.
 * 
 * @param config Configuration options for error suppression
 * @returns Cleanup function to restore original handlers
 * 
 * @example
 * * // Set up error suppression
 * const cleanup = suppressResizeObserverErrors({
 *   debounceDelay: 100,
 *   logSuppressed: true
 * });
 * 
 * // Later, clean up when no longer needed
 * cleanup();
 * */
export function suppressResizeObserverErrors(
  config: ErrorSuppressionConfig = {}
): CleanupFunction {
  const {
    debounceDelay = 100,
    logSuppressed = false,
    suppressedLogger = console.debug
  } = config;

  // Store original handlers for cleanup
  const originalHandlers: OriginalHandlers = {
    consoleError: console.error,
  };

  // Debounced error handler to prevent spam
  const debouncedHandler = debounce((message: string, ...args: any[]) => {
    if (logSuppressed && suppressedLogger) {
      suppressedLogger('Suppressed ResizeObserver error:', message, ...args);
    }
  }, debounceDelay);

  // Override console.error to filter ResizeObserver messages
  console.error = function(message: any, ...args: any[]) {
    const messageString = String(message);
    
    if (isResizeObserverError(messageString)) {
      debouncedHandler(messageString, ...args);
      return;
    }
    
    // Let other errors pass through
    originalHandlers.consoleError.call(console, message, ...args);
  };

  // Window error handler for uncaught errors
  const errorHandler = (event: ErrorEvent): void => {
    if (event.error && isResizeObserverError(event.message)) {
      debouncedHandler(event.message, event.error);
      event.preventDefault();
      return;
    }
  };

  // Promise rejection handler for async ResizeObserver errors
  const rejectionHandler = (event: PromiseRejectionEvent): void => {
    const reason = event.reason;
    const message = reason?.message || String(reason);
    
    if (isResizeObserverError(message)) {
      debouncedHandler(message, reason);
      event.preventDefault();
      return;
    }
  };

  // Add event listeners if we're in a browser environment
  if (typeof window !== 'undefined') {
    originalHandlers.errorHandler = errorHandler;
    originalHandlers.rejectionHandler = rejectionHandler;
    
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);
  }

  // Return cleanup function
  return (): void => {
    // Restore console.error
    console.error = originalHandlers.consoleError;
    
    // Remove window event listeners
    if (typeof window !== 'undefined') {
      if (originalHandlers.errorHandler) {
        window.removeEventListener('error', originalHandlers.errorHandler);
      }
      if (originalHandlers.rejectionHandler) {
        window.removeEventListener('unhandledrejection', originalHandlers.rejectionHandler);
      }
    }
  };
}

/**
 * React hook that automatically sets up ResizeObserver error suppression
 * on component mount and cleans up on unmount.
 * 
 * @param config Configuration options for error suppression
 * 
 * @example
 * * function MyComponent() {
 *   // Automatically suppress ResizeObserver errors for this component
 *   useResizeObserverErrorSuppression({
 *     debounceDelay: 150,
 *     logSuppressed: process.env.NODE_ENV === 'development'
 *   });
 *   
 *   return <div>Component with ResizeObserver usage</div>;
 * }
 * */
export function useResizeObserverErrorSuppression(
  config: ErrorSuppressionConfig = {}
): void {
  const setupSuppression = useCallback(() => {
    return suppressResizeObserverErrors(config);
  }, [config]);

  useEffect(() => {
    // Set up error suppression on mount
    const cleanup = setupSuppression();
    
    // Clean up on unmount
    return cleanup;
  }, [setupSuppression]);
}

/**
 * Utility function to check if the current environment supports ResizeObserver
 * @returns True if ResizeObserver is available
 */
export function isResizeObserverSupported(): boolean {
  return typeof window !== 'undefined' && 'ResizeObserver' in window;
}

/**
 * Higher-order function that wraps a ResizeObserver callback with error suppression
 * @param callback Original ResizeObserver callback
 * @returns Wrapped callback with error handling
 */
export function withResizeObserverErrorSuppression<T extends ResizeObserverCallback>(
  callback: T
): T {
  return ((entries, observer) => {
    try {
      callback(entries, observer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!isResizeObserverError(message)) {
        // Re-throw non-ResizeObserver errors
        throw error;
      }
      // Silently ignore ResizeObserver errors
    }
  }) as T;
}