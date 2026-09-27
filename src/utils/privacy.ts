/**
 * Privacy & Data Protection Utility for Insurance Records
 * Implements tokenization, pseudonymization, and PII masking for GDPR, HIPAA, and GLBA compliance.
 */

export function maskName(name: string): string {
  if (!name) return 'Anonymous';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0][0] + '****';
  }
  return `${parts[0][0]}. ${parts[parts.length - 1][0]}****`;
}

export function maskSSN(ssn: string): string {
  if (!ssn) return '***-**-****';
  const clean = ssn.replace(/\D/g, '');
  if (clean.length >= 4) {
    return `***-**-${clean.slice(-4)}`;
  }
  return '***-**-****';
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'user@***.com';
  const [user, domain] = email.split('@');
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return '(***) ***-****';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `(***) ***-${digits.slice(-4)}`;
  }
  return '(***) ***-****';
}

export function maskPolicyNumber(policyNo: string): string {
  if (!policyNo) return 'POL-***';
  if (policyNo.length > 5) {
    return `${policyNo.slice(0, 3)}-***-${policyNo.slice(-3)}`;
  }
  return 'POL-***';
}

export function generateTokenId(str: string, prefix = 'TOK'): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `${prefix}-${positive.slice(0, 4)}-${positive.slice(4, 8)}`;
}
