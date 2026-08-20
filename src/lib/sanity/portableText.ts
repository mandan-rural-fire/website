import { toHTML } from '@portabletext/to-html';
import type { PortableTextBlock } from '@portabletext/types';

/**
 * Portable Text to HTML.
 *
 * The generated Sanity types model blocks with optional `children` and `style`,
 * while PortableTextBlock requires them. The shapes are identical at runtime, so
 * the single cast is contained here rather than repeated at every call site.
 *
 * Returns null for empty bodies so callers can branch instead of rendering nothing.
 */
export function renderBody<T extends { _type: string }>(
  blocks: T[] | null | undefined,
): string | null {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  return toHTML(blocks as unknown as PortableTextBlock[]);
}
