import { createImageUrlBuilder } from '@sanity/image-url';
import { sanityClient } from './client';

const builder = createImageUrlBuilder(sanityClient);

/**
 * Minimal structural shape an image needs to be buildable. Generated types from
 * any query that selects an image field satisfy this, so callers pass those
 * directly rather than importing a named image type.
 */
export interface ImageRef {
  asset?: { _ref?: string | null } | null;
  alt?: string | null;
}

/** Null when no image is set, so callers can render a placeholder instead of a broken img. */
export function imageUrl(source: ImageRef | null | undefined, width = 1200): string | null {
  if (!source?.asset?._ref) return null;
  return builder
    .image(source as never)
    .width(width)
    .auto('format')
    .url();
}

/** Alt text with a sensible fallback. Empty string is valid for decorative images. */
export function imageAlt(source: ImageRef | null | undefined, fallback = ''): string {
  return source?.alt ?? fallback;
}

/**
 * Intrinsic dimensions, parsed from the asset ref, which encodes them:
 * image-<id>-<width>x<height>-<format>. No extra API call needed.
 */
export function imageDims(
  source: ImageRef | null | undefined,
): { width: number; height: number } | null {
  const m = /-(\d+)x(\d+)-[a-z]+$/i.exec(source?.asset?._ref ?? '');
  if (!m?.[1] || !m[2]) return null;
  return { width: Number(m[1]), height: Number(m[2]) };
}

/** A srcset over the given widths, deduplicated and capped at the intrinsic width. */
export function imageSrcSet(source: ImageRef | null | undefined, widths: number[]): string | null {
  if (!source?.asset?._ref) return null;
  const max = imageDims(source)?.width;
  const steps = [...new Set(widths.map((w) => (max ? Math.min(w, max) : w)))].sort((a, b) => a - b);
  const parts = steps.map((w) => `${imageUrl(source, w)} ${w}w`);
  return parts.length > 0 ? parts.join(', ') : null;
}
