/**
 * Comprehensive Strict Email Validator
 * Validates standard RFC format, valid top-level domain (TLD),
 * and blocks disposable/temporary spam domains.
 */

// Common disposable / fake temporary email providers
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  '10minutemail.com',
  'yopmail.com',
  'trashmail.com',
  'dispostable.com',
  'sharklasers.com',
  'fake.com',
  'test.com',
  'example.com',
  'burnermail.io',
  'throwawaymail.com',
  'getairmail.com',
  'maildrop.cc',
  'inboxkitten.com',
  'crazymailing.com',
  'mytemp.email',
]);

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  normalizedEmail: string;
}

export function validateEmailAddress(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required', normalizedEmail: '' };
  }

  const clean = email.trim().toLowerCase();

  // Basic length check
  if (clean.length < 6 || clean.length > 254) {
    return { isValid: false, error: 'Email address must be between 6 and 254 characters', normalizedEmail: clean };
  }

  // Strict regex for valid email format
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(clean)) {
    return { isValid: false, error: 'Please enter a valid email format (e.g. name@gmail.com)', normalizedEmail: clean };
  }

  const parts = clean.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email structure', normalizedEmail: clean };
  }

  const [username, domain] = parts;

  // Validate username part
  if (username.length < 2) {
    return { isValid: false, error: 'Email username must be at least 2 characters', normalizedEmail: clean };
  }

  if (username.includes('..')) {
    return { isValid: false, error: 'Email cannot contain consecutive dots', normalizedEmail: clean };
  }

  // Validate domain part
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return { isValid: false, error: 'Email must include a valid domain extension (e.g. .com, .in)', normalizedEmail: clean };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return { isValid: false, error: 'Invalid domain extension (.com, .in, .net, etc.)', normalizedEmail: clean };
  }

  // Block disposable / temporary fake domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { isValid: false, error: 'Temporary or disposable email addresses are not permitted', normalizedEmail: clean };
  }

  return { isValid: true, normalizedEmail: clean };
}
