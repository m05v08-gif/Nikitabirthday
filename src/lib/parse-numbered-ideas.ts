/**
 * Parses LLM output if it's a numbered list like:
 * "1. ...\n2. ...\n3. ..."
 * Returns null if it doesn't look like that.
 */
export function parseNumberedIdeas(text: string): string[] | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const items: string[] = [];
  for (const line of lines) {
    const m = line.match(/^(\d+)[.)]\s*(.+)$/);
    if (!m) {
      return null;
    }
    const n = Number(m[1]);
    const content = m[2]?.trim() ?? "";
    if (!Number.isFinite(n) || !content) return null;
    items.push(content);
  }

  if (items.length === 0) return null;
  return items;
}
