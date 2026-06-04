// ─── Date formatting ──────────────────────────────────────────────────────────

export function formatReleaseDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ─── Playtime ─────────────────────────────────────────────────────────────────

export function toPlaytimeString(playtime: number | null | undefined): string {
  if (!playtime || playtime <= 0) return 'N/A';
  return `${playtime}h avg`;
}

// ─── Genre / Platform helpers ─────────────────────────────────────────────────

export function firstGenre(genres: string | null | undefined): string {
  return genres?.split(',')[0]?.trim() ?? '';
}

export function firstPlatform(platforms: string | null | undefined): string {
  return platforms?.split(',')[0]?.trim() ?? '';
}

// ─── Password strength ────────────────────────────────────────────────────────

export type PasswordStrength = 0 | 1 | 2 | 3;

export function getPasswordStrength(password: string): PasswordStrength {
  if (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)
  ) return 3;
  if (password.length >= 8 && (/[A-Z]/.test(password) || /[0-9]/.test(password))) return 2;
  if (password.length >= 6) return 1;
  return 0;
}

export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 3: return 'Strong';
    case 2: return 'Good';
    case 1: return 'Weak';
    default: return 'Too weak';
  }
}

export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 3: return '#4CAF50';
    case 2: return '#FFD700';
    case 1: return '#FF9800';
    default: return '#E53935';
  }
}

// ─── Rating format ────────────────────────────────────────────────────────────

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// ─── Year from date string ────────────────────────────────────────────────────

export function extractYear(dateStr: string | null | undefined): string {
  return dateStr?.slice(0, 4) ?? '';
}