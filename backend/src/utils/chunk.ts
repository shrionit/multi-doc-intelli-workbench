/**
 * Chunk large text content into smaller pieces for LLM processing.
 */
export function chunkText(text: string, maxChunkSize: number = 4000, overlap: number = 200): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChunkSize;

    // Try to break at a natural boundary (newline, period, space)
    if (end < text.length) {
      const searchWindow = text.substring(end - 100, end);
      const lastNewline = searchWindow.lastIndexOf('\n');
      const lastPeriod = searchWindow.lastIndexOf('. ');
      const lastSpace = searchWindow.lastIndexOf(' ');

      const bestBreak = Math.max(lastNewline, lastPeriod, lastSpace);
      if (bestBreak > 0) {
        end = end - 100 + bestBreak + 1;
      }
    }

    chunks.push(text.substring(start, end));
    start = end - overlap;
  }

  return chunks;
}
