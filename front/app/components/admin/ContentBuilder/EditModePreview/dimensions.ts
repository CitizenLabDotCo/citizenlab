// Shared device-frame dimensions for iframe previews, so the content builder
// edit preview and the project page preview stay in sync.
export const devicePreviewSizes = {
  mobile: { frameWidth: '360px', iframeWidth: '320px' },
  desktop: { frameWidth: '1140px', iframeWidth: '1100px' },
  frameHeight: '620px',
  iframeHeight: '560px',
} as const;
