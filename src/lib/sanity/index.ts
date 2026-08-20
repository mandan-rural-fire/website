// Barrel. Pages import from '../lib/sanity' and get everything they need.
// Raw GROQ constants stay internal to the lib; pages go through fetchers.
export { sanityClient } from './client';
export { imageUrl, imageAlt, imageDims, imageSrcSet, type ImageRef } from './image';
export { renderBody } from './portableText';
export * from './fetchers';
