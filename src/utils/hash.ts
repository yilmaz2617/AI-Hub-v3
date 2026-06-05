export function hashString(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    h = ((h << 5) - h + char) | 0;
  }
  return Math.abs(h).toString(36);
}

export function hashObject(obj: unknown): string {
  return hashString(JSON.stringify(obj, Object.keys(obj as object).sort()));
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
