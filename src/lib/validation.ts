import { z } from "zod";

// Helper function to sanitize strings by removing HTML tags and dangerous content
export const sanitizeString = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>&"']/g, (char) => {
      // Escape dangerous characters
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return escapeMap[char] || char;
    })
    .trim();
};

// Helper function for email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Status enum validation
export const StatusEnum = z.enum(['new', 'in_work', 'done', 'rejected']);

// Lead schema with comprehensive validations
export const LeadSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters")
    .transform(sanitizeString),
  
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters")
    .refine(validateEmail, "Invalid email format")
    .transform((email) => email.toLowerCase().trim()),
  
  phone: z
    .string()
    .optional()
    .transform((phone) => phone ? sanitizeString(phone) : undefined),
  
  workType: z
    .string()
    .min(2, "Work type must be at least 2 characters long")
    .max(100, "Work type must not exceed 100 characters")
    .transform(sanitizeString),
  
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(2000, "Description must not exceed 2000 characters")
    .transform(sanitizeString),
  
  source: z
    .string()
    .optional()
    .transform((source) => source ? sanitizeString(source) : undefined),
  
  status: StatusEnum.default('new').optional()
});

// Infer TypeScript type from schema
export type LeadInput = z.infer<typeof LeadSchema>;

// Export status type for convenience
export type LeadStatus = z.infer<typeof StatusEnum>;