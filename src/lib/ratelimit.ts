interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

export class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Clean up old entries every 5 minutes to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  public checkLimit(ip: string): RateLimitResult {
    const now = Date.now();
    const entry = this.limits.get(ip);

    // If no entry exists or the window has expired, create a new one
    if (!entry || now >= entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs
      };
      
      this.limits.set(ip, newEntry);
      
      return {
        success: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime,
        totalRequests: 1
      };
    }

    // Check if limit is exceeded
    if (entry.count >= this.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
        totalRequests: entry.count
      };
    }

    // Increment the count
    entry.count++;
    this.limits.set(ip, entry);

    return {
      success: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
      totalRequests: entry.count
    };
  }

  public getRemainingRequests(ip: string): number {
    const now = Date.now();
    const entry = this.limits.get(ip);

    if (!entry || now >= entry.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - entry.count);
  }

  public getResetTime(ip: string): number | null {
    const entry = this.limits.get(ip);
    return entry ? entry.resetTime : null;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(ip);
      }
    }
  }

  public getStats(): { totalIPs: number; totalRequests: number } {
    let totalRequests = 0;
    for (const entry of this.limits.values()) {
      totalRequests += entry.count;
    }

    return {
      totalIPs: this.limits.size,
      totalRequests
    };
  }

  public reset(ip?: string): void {
    if (ip) {
      this.limits.delete(ip);
    } else {
      this.limits.clear();
    }
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.limits.clear();
  }
}

// Export a singleton instance for the error logging API
export const errorLogRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute