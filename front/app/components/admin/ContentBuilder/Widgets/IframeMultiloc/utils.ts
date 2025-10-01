import { SupportedLocale, Multiloc } from 'typings';

export type AspectRatioType = '16:9' | '4:3' | '3:4' | '1:1' | 'custom';
export type EmbedModeType = 'fixed' | 'aspectRatio';

export interface IframeProps {
  url: string;
  height: number;
  hasError: boolean;
  errorType?: string;
  title?: Multiloc;
  selectedLocale: SupportedLocale;
  embedMode?: EmbedModeType;
  tabletHeight?: number;
  mobileHeight?: number;
  aspectRatio?: AspectRatioType;
  customAspectRatio?: string;
}

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

export const validateAspectRatio = (aspectRatio: string) => {
  const split = aspectRatio.split(':');
  if (split.length !== 2) return false;

  const [widthStr, heightStr] = split;
  const [width, height] = split.map((num) => parseFloat(num));
  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) return false;

  if (widthStr !== width.toString() || heightStr !== height.toString())
    return false;

  return true;
};
