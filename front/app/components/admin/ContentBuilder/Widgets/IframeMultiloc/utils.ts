export type AspectRatioType = '16:9' | '4:3' | '3:4' | '1:1' | 'custom';
export type EmbedModeType = 'fixed' | 'aspectRatio';

/**
 * Calculate CSS padding-bottom percentage for aspect ratios
 */
export const getAspectRatioPercentage = (
  aspectRatio: AspectRatioType,
  customAspectRatio?: string
): number => {
  if (aspectRatio === 'custom' && customAspectRatio) {
    const [width, height] = customAspectRatio.split(':').map(Number);
    return width && height ? (height / width) * 100 : 56.25; // fallback to 16:9
  }

  const ratios: Record<AspectRatioType, number> = {
    '16:9': 56.25, // 9/16 * 100
    '4:3': 75, // 3/4 * 100
    '3:4': 133.33, // 4/3 * 100
    '1:1': 100, // 1/1 * 100
    custom: 56.25, // fallback
  };

  return ratios[aspectRatio] || 56.25;
};

/**
 * Calculate responsive height based on mode and breakpoint
 */
export const getResponsiveHeight = (
  embedMode: 'fixed' | 'aspectRatio',
  height: number | string,
  isMobile: boolean,
  isTablet: boolean,
  tabletHeight?: number,
  mobileHeight?: number
): number | string => {
  if (embedMode === 'fixed') {
    const baseHeight = parseInt(height.toString() || '400', 10);

    if (isMobile && mobileHeight) {
      return parseInt(mobileHeight.toString() || '200', 10);
    } else if (isTablet && tabletHeight) {
      return parseInt(tabletHeight.toString() || '300', 10);
    }

    return baseHeight;
  }

  // Aspect ratio mode - height will be handled by CSS
  return 'auto';
};
