// The device frame is drawn as a border around the iframe (see EditModePreview),
// so the frame is always the previewed viewport plus the bezels. Deriving it here
// keeps the two from drifting apart when a viewport size is changed.
const BEZEL_TOP = 40;
const BEZEL_SIDE = 20;
const BEZEL_BOTTOM = 20;

const MOBILE_VIEWPORT_WIDTH = 330;
const DESKTOP_VIEWPORT_WIDTH = 1100;
const VIEWPORT_HEIGHT = 579;

export const DEVICE_FRAME_BORDER_WIDTH = `${BEZEL_TOP}px ${BEZEL_SIDE}px ${BEZEL_BOTTOM}px ${BEZEL_SIDE}px`;

const withBezels = (iframeWidth: number) => ({
  iframeWidth,
  frameWidth: iframeWidth + 2 * BEZEL_SIDE,
});

export const devicePreviewSizes = {
  mobile: withBezels(MOBILE_VIEWPORT_WIDTH),
  desktop: withBezels(DESKTOP_VIEWPORT_WIDTH),
  frameHeight: VIEWPORT_HEIGHT + BEZEL_TOP + BEZEL_BOTTOM,
  iframeHeight: VIEWPORT_HEIGHT,
} as const;
