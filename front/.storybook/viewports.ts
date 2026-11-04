// The viewport presets of the design-system workbench, shared by the
// Storybook toolbar (preview.tsx) and the workbench shell's toolbar.
export const GV_VIEWPORTS = {
  gvMobile: {
    name: 'Mobile 390',
    styles: { width: '390px', height: '844px' },
    type: 'mobile',
  },
  gvTablet: {
    name: 'Tablet 820',
    styles: { width: '820px', height: '1180px' },
    type: 'tablet',
  },
  gvDesktop: {
    name: 'Desktop 1280',
    styles: { width: '1280px', height: '800px' },
    type: 'desktop',
  },
  gvWide: {
    name: 'Wide 1600',
    styles: { width: '1600px', height: '900px' },
    type: 'desktop',
  },
} as const;

export type GvViewport = keyof typeof GV_VIEWPORTS;
