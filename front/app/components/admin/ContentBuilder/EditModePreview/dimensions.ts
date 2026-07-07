// Shared device-frame dimensions (px) for iframe previews, so the content
// builder edit preview and the project page preview stay in sync. The iframe
// always renders at these logical sizes; the frame is visually scaled to fit
// the available space.
export const devicePreviewSizes = {
  mobile: { frameWidth: 321, iframeWidth: 281 },
  desktop: { frameWidth: 1140, iframeWidth: 1100 },
  frameHeight: 639,
  iframeHeight: 579,
} as const;
