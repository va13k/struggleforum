export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeAvatarUrl(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function normalizeOptionalText(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function extractMentions(content: string) {
  return [...new Set(content.match(/@[a-zA-Z0-9_]+/g)?.map((item) => item.slice(1)) ?? [])];
}
