export function compressJSON(obj: unknown): string {
  return JSON.stringify(obj);
}

export function decompressJSON(str: string): unknown {
  return JSON.parse(str);
}

export function toBase64(str: string): string {
  if (typeof window !== 'undefined') return btoa(str);
  return Buffer.from(str).toString('base64');
}

export function fromBase64(str: string): string {
  if (typeof window !== 'undefined') return atob(str);
  return Buffer.from(str, 'base64').toString('utf-8');
}
