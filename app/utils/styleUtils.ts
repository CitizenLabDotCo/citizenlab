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

export function calculateContrastRatio(backgroundColor: number[], textColor: number[]) {
  function luminanace(r: number, g: number, b: number) {
    const a: any = [r, g, b].map((val: number) => {
      let v = val;
      v /= 255;

      return v <= 0.03928
        ? v / 12.92
        : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  const contrastRatio = (luminanace(backgroundColor[0], backgroundColor[1], backgroundColor[2]) + 0.05)
    / (luminanace(textColor[0], textColor[1], textColor[2]) + 0.05);

  return contrastRatio;
}

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export const colors = {
  text: '#222',
  text2: '#767676',
  placeholder: '#aaa',
  clBlue: '#008292',
  // this is the first grey to get 4.5 on the light greyish background we often use (#f9f9fa)
  clGreyOnGreyBackground: '#737373',
  // hover color used for clGrey (e.g. in the navbar)
  clGreyHover: '#222',
  // background color of dropdown items (e.g. in the navbar)
  clDropdownHoverBackground: '#e9e9e9',
  clGreen: '#04884C',
  // darker green than clGreen for when we have a light green background (clGreenSuccessBackground)
  clGreenSuccess: '#008040',
  clGreenSuccessBackground: '#e4f7ef',
  clRed: '#E52516',
  // darker red than clRed for when we have a light red background (clRedSuccessBackground)
  clRedError: '#D61607',
  clRedErrorBackground: '#fde9e8',
  label: '#596B7A',
  draftYellow: '#8C680D',
  mediumGrey: '#BDBDBD',
  lightGreyishBlue: '#EBEDEF',
  separation: '#e0e0e0',
  background: '#F9F9FA',
  clBlueDark: '#147985',
  clBlueDarkBg: '#d3ecf0',
  clBlueDarker: '#0A5159',
  clBlueDarkest: '#02282D',
  clBlueLightest: '#BEE7EB',
  clBlueLighter: '#80CFD8',
  clBlueLight: '#40B8C5',
  placeholderBg: '#CFD6DB',

  // Admin colors
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

  // Icon colors
  clIconPrimary: '#00577C',
  clIconSecondary: '#84939E',
  clIconAccent: '#01A1B1',
  clIconBackground: 'rgba(1, 161, 177, 0.07)',

  // social
  facebook: '#3b5998',
  facebookMessenger: '#0084ff',
  twitter: '#1ea4f2'
};

export function color(name: keyof typeof colors) {
  return colors[name];
}

export const fontSizes = {
  xs: 12,
  small: 14,
  base: 16,
  medium: 17,
  large: 18,
  xl: 21,
  xxl: 25,
  xxxl: 30,
  xxxxl: 34
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

export function quillEditedContent() {
  return `
    max-width: 100%;
    .ql-align-right {
      text-align: right;
    }
    .ql-align-center {
      text-align: center;
    }
    p, h1, h2, ul, ol {
      margin: 0;
      margin-bottom: 30px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    iframe {
      max-width: 100%;
    }
  `;
}
