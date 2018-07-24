import { css } from 'styled-components';

export const media = {
  smallPhone: (style: any, ...args) => css`
    @media (max-width: 320px) {
      ${css(style, ...args)}
    }
  `,
  phone: (style: any, ...args) => css`
    @media (max-width: 360px) {
      ${css(style, ...args)}
    }
  `,
  largePhone: (style: any, ...args) => css`
    @media (max-width: 410px) {
      ${css(style, ...args)}
    }
  `,
  biggerThanPhone: (style: any, ...args) => css`
    @media (min-width: 360px) {
      ${css(style, ...args)}
    }
  `,
  biggerThanLargePhone: (style: any, ...args) => css`
    @media (min-width: 410px) {
      ${css(style, ...args)}
    }
  `,
  tablet: (style: any, ...args) => css`
    @media (min-width: 768px) and (max-width: 1024px) {
      ${css(style, ...args)}
    }
  `,
  tabletLandscape: (style: any, ...args) => css`
    @media (min-width: 768px) and (max-width: 1024px) and (orientation : landscape) {
      ${css(style, ...args)}
    }
  `,
  tabletPortrait: (style: any, ...args) => css`
    @media (min-width: 768px) and (max-width: 1024px) and (orientation : portrait) {
      ${css(style, ...args)}
    }
  `,
  smallerThanMinTablet: (style: any, ...args) => css`
    @media (max-width: 768px) {
      ${css(style, ...args)}
    }
  `,
  biggerThanMinTablet: (style: any, ...args) => css`
    @media (min-width: 768px) {
      ${css(style, ...args)}
    }
  `,
  smallerThanMaxTablet: (style: any, ...args) => css`
    @media (max-width: 1024px) {
      ${css(style, ...args)}
    }
  `,
  biggerThanMaxTablet: (style: any, ...args) => css`
    @media (min-width: 1025px) {
      ${css(style, ...args)}
    }
  `,
  smallerThan1280px: (style: any, ...args) => css`
    @media (max-width: 1280px) {
      ${css(style, ...args)}
    }
  `,
};

export function remCalc(desiredSize: number) {
  return `${(desiredSize / fontSizes.small).toString().substring(0, 6).trim()}rem`;
}

export const colors = {
  clBlue: '#01A1B1',
  clGrey: '#767676',
  clGreyHover: '#222',
  clGreen: '#04884C',
  darkClGreen: '#004949',
  success: '#32B67A',
  error: '#FC3C2D',
  label: '#596B7A',
  draftYellow: '#8C680D',
  mediumGrey: '#BDBDBD',
  lightGreyishBlue: '#EBEDEF',
  separation: '#EAEAEA',
  background: '#F9F9FA',
  clBlueDarkest: '#02282D',
  clBlueDarker: '#0A5159',
  clBlueDark: '#147985',
  clBlueLightest: '#BEE7EB',
  clBlueLighter: '#80CFD8',
  clBlueLight: '#40B8C5',
  placeholderBg: '#CFD6DB',
  clBlue2Darkest: '#044D6C',

  adminBackground: '#F0F3F4',
  adminContentBackground: '#fff',
  adminMenuBackground: '#003349',
  adminDarkestBackground: 'rgba(0, 0, 0, 0.75)',

  adminTextColor: '#044D6C',
  adminLightText: 'rgba(255, 255, 255, 0.8)',
  adminSecondaryTextColor: '#84939E',
  adminBorder: '#EAEAEA',
  adminSeparation: '#EAEAEA',

  adminOrangeIcons: '#FF672F',
  clIconPrimary: '#00577C',
  clIconSecondary:'#84939E',
  clIconAccent:'#01A1B1',
  clIconBackground:'rgba(1, 161, 177, 0.07)',
};

export function color(name: keyof typeof colors) {
  return colors[name];
}

export const fontSizes = {
  xs: 12,
  small: 14,
  base: 16,
  large: 18,
  xl: 21,
  xxl: 25,
  xxxl: 30,
};

export function fontSize(name: keyof typeof fontSizes) {
  return `${fontSizes[name]}px`;
}

export function invisibleA11yText() {
  /* See: https://snook.ca/archives/html_and_css/hiding-content-for-accessibility */
  return `
  position: absolute !important;
  height: 1px; width: 1px;
  overflow: hidden;
  clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
  clip: rect(1px, 1px, 1px, 1px);
`;
}

export function booleanClass(value: any, className: string) {
  if (!!value) return ` ${className}`;
  return '';
}
