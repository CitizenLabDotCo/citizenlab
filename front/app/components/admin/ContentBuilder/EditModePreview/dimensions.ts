// Shared device-frame dimensions for iframe previews, so the content builder
// edit preview and the project page preview stay in sync.
export const devicePreviewSizes = {
  mobile: { frameWidth: '321px', iframeWidth: '281px' },
  desktop: { frameWidth: '1140px', iframeWidth: '1100px' },
  frameHeight: '639px',
  iframeHeight: '579px',
} as const;
