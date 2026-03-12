import 'focus-visible';
import { get } from 'lodash-es';
import { darken, transparentize } from 'polished';
import { css } from 'styled-components';

import { isNilOrError } from './helperUtils';
import { FontWeight, InputSize } from './typings';

export const isRtl = (style: any, ...args: any[]) => css`
  ${(props) => (props.theme.isRtl ? css(style, ...args) : '')}
`;

// Media
export const viewportWidths = {
  phone: 769,
  tablet: 1200,
  smallDesktop: 1366,
};

export const media = {
  phone: (style: any, ...args: any) => css`
    @media (max-width: ${viewportWidths.phone}px) {
      ${css(style, ...args)}
    }
  `,
  tablet: (style: any, ...args: any) => css`
    @media (max-width: ${viewportWidths.tablet}px) {
      ${css(style, ...args)}
    }
  `,
  smallDesktop: (style: any, ...args: any) => css`
    @media (max-width: ${viewportWidths.smallDesktop}px) {
      ${css(style, ...args)}
    }
  `,
  desktop: (style: any, ...args: any) => css`
    @media (min-width: ${viewportWidths.tablet}px) {
      ${css(style, ...args)}
    }
  `,
};

export const themeColors = {
  /**
   * Base
   */
  black: '#000000', // formerly focussedBorder, hoveredBorder
  white: '#ffffff', // formerly adminContentBackground
  /**
   * Grey
   */
  grey800: '#333333', // formerly text
  grey700: '#767676', // formerly border, grey
  grey600: '#999999', // formerly placeholder
  grey500: '#BDBDBD', // formerly mediumGrey
  grey400: '#CBCBCB', // formerly popoverDarkFg
  grey300: '#E0E0E0', // formerly separationDark
  grey200: '#EBEDEF', // formerly lightGreyishBlue
  grey100: '#F4F6F8',
  grey50: '#FCFCFC',
  coolGrey700: '#43515D',
  coolGrey600: '#596B7A', // formerly label, adminSecondaryTextColor
  coolGrey500: '#84939E', // formerly secondaryText, clIconSecondary
  coolGrey300: '#B8C5D0', // formerly tagHoverBackgroundColor
  /**
   * Blue
   */
  blue700: '#022331',
  blue500: '#044D6C', // formerly adminTextColor, emailText
  blue400: '#00577C', // formerly clIconPrimary
  /**
   * Teal
   */
  teal700: '#0A5159', // formerly clBlueDarker
  teal500: '#147985', // formerly clBlueDark
  teal400: '#01A1B1', // formerly clIconAccent
  teal300: '#40B8C5', // formerly clBlueLight
  teal200: '#80CFD8', // formerly clBlueLighter
  teal100: '#BEE7EB', // formerly clBlueLightest
  teal50: '#EDF8FA',
  /**
   * Red
   */
  red100: '#fde9e8', // formerly clRedErrorBackground
  red400: '#FC3C2D', // formerly clRed2
  red500: '#E52516', // formerly clRed
  red600: '#D61607', // formerly clRedError
  red800: '#9B1005',
  /**
   * Green
   */
  green700: '#024D2B',
  green500: '#04884C', // formerly clGreen
  green400: '#32B67A',
  green300: '#62C462',
  green100: '#e4f7ef', // formerly clGreenSuccessBackground

  /**
   * Orange
   */
  orange100: '#FFECE6',
  orange500: '#FF672F', // formerly adminOrangeIcons

  /**
   * Other
   */
  brown: '#8C680D', // formerly draftYellow
};

export const semanticColors = {
  textPrimary: themeColors.grey800,
  borderDark: themeColors.grey700,
  placeholder: themeColors.grey600,
  disabled: themeColors.grey500,
  borderLight: themeColors.grey400,
  divider: themeColors.grey300,
  textSecondary: themeColors.coolGrey600,
  primary: themeColors.blue500,
  teal: themeColors.teal500,
  tealLight: themeColors.teal100,
  error: themeColors.red500,
  errorLight: themeColors.red100,
  success: themeColors.green500,
  successLight: themeColors.green100,
  background: '#EDEFF0', // formerly background, backgroundLightGrey
  twitter: '#1ea4f2',
  facebook: '#3b5998',
  facebookMessenger: '#0084ff',
};

export const colors = {
  ...semanticColors,
  ...themeColors,
};

export type Color =
  | keyof typeof colors
  | 'tenantPrimary'
  | 'tenantPrimaryLighten75'
  | 'tenantPrimaryLighten95'
  | 'tenantPrimaryLighten90'
  | 'tenantSecondary'
  | 'tenantText'
  | 'inherit';

export const fontSizes = {
  xs: 12,
  s: 14,
  base: 16,
  m: 16,
  l: 18,
  xl: 21,
  xxl: 25,
  xxxl: 30,
  xxxxl: 34,
  xxxxxl: 42,
};

export type FontSizesType = keyof typeof fontSizes;

export const boxShadow = css`
  box-shadow: 0px 4px 3px rgba(0, 0, 0, 0.05);
`;

export const defaultStyles = {
  boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.06)',
  boxShadowHoverSmall: '0px 2px 4px -1px rgba(0,0,0,0.2)',
  boxShadowHoverBig: '0px 4px 12px -1px rgba(0,0,0,0.12)',
  boxShadowError: `0 0 0 3px ${transparentize(0.65, colors.red600)}`,
  inputPadding: '12px',
};

export const defaultCardStyle = css`
  background: #fff;
  border-radius: ${(props) => props.theme.borderRadius};
  box-shadow: ${defaultStyles.boxShadow};
`;

export const defaultCardHoverStyle = css`
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform, box-shadow;
  transition: all 150ms ease-out;

  &.hover,
  &:hover {
    box-shadow: ${defaultStyles.boxShadowHoverBig};
    transform: translate(0px, -3px);
  }
`;

export const defaultOutline = css`
  border: 2px solid ${(props) => props.theme.colors.tenantPrimary};
`;

export const stylingConsts = {
  menuHeight: 78,
  mobileMenuHeight: 72,
  mobileTopBarHeight: 66,
  footerHeight: 60,
  maxPageWidth: 952,
  inputHeight: 48,
  bannerWidth: 1340,
  pageWidth: 1150,
  textWidth: 720,
  borderRadius: '3px',
  border: `1px solid ${colors.divider}`,
};

type DefaultInputStyleProps = {
  theme: MainThemeProps;
  height?: string | number;
  size?: InputSize;
};

const getHeight = (props: DefaultInputStyleProps) => {
  if (typeof props.height === 'string') {
    return props.height;
  }
  if (typeof props.height === 'number') {
    return `${props.height}px`;
  }
  return `${stylingConsts.inputHeight}px`;
};

export const defaultInputStyle = css`
  color: ${colors.textPrimary};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  padding: ${defaultStyles.inputPadding};
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px ${colors.borderDark};
  background: #fff;
  cursor: text;
  outline: none;
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  transition: box-shadow 100ms ease-out;
  height: ${getHeight};

  &:not(:disabled):not(.disabled) {
    &:not(.error):hover,
    &:not(.error).hover {
      border-color: ${colors.black};
    }

    &:not(.error):focus,
    &:not(.error).focus {
      ${defaultOutline};
    }

    &.error {
      border-color: ${colors.red600};

      &:focus,
      &.focus {
        box-shadow: ${defaultStyles.boxShadowError};
      }
    }
  }

  &:disabled,
  &.disabled {
    opacity: 1;
    color: #666;
    background-color: #f9f9f9;
    border-color: #ccc;
    cursor: not-allowed;
  }
  ${(props: { size?: InputSize }) =>
    props.size === 'small' &&
    css`
      font-size: ${fontSizes.s}px;
      padding: 10px;
    `}
  }
`;

export const getFontWeightCSS = (fontWeight: FontWeight) => {
  switch (fontWeight) {
    case 'bold': // Value of 700
      return 'bold';
    case 'semi-bold':
      return 600;
    case 'normal':
      return 'normal'; // Value of 400
  }
};

type StylingConstsType = {
  menuHeight: number;
  mobileMenuHeight: number;
  mobileTopBarHeight: number;
  footerHeight: number;
  maxPageWidth: number;
  bannerWidth: number;
  pageWidth: number;
  textWidth: number;
  borderRadius: string;
};

// Reusable text styling
export function quillEditedContent(
  buttonColor = colors.teal,
  textColor = colors.textPrimary,
  mentionColor = colors.textPrimary,
  fontSize: 's' | 'base' | 'm' | 'l' = 'base',
  fontWeight: 300 | 400 = 400
) {
  const lineHeight = 1.5;

  const defaultFontStyle = `
    color: ${textColor};
    font-size: ${fontSizes[fontSize]}px;
    font-weight: ${fontWeight};
    line-height: ${lineHeight};
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  `;

  return `
    ${defaultFontStyle}

    li, p {
      ${defaultFontStyle}
    }

    &:after {
      content: "";
      display: table;
      clear: both;
    }

    h2 {
      font-size: ${fontSizes.xxl}px;
      line-height: 1.3;
      font-weight: bold;
      padding: 0;
      margin: 0 0 16px 0;

      a {
        font-size: inherit;
        font-weight: inherit;
        text-decoration: underline;
      }
    }

    h3 {
      font-size: ${fontSizes.xl}px;
      line-height: 1.3;
      font-weight: bold;
      padding: 0;
      margin: 0 0 16px 0;

      a {
        font-size: inherit;
        font-weight: inherit;
        text-decoration: underline;
      }
    }

    p {
      margin: 0 0 16px 0;

      &:last-child {
        margin-bottom: 0px;
      }
    }

    a {
      color: #0000EE; /* Standard fallback for all browsers */
      color: -webkit-link; /* Overrides the fallback in WebKit browsers */
      text-decoration: underline;
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-all;
      word-break: break-word;
      hyphens: auto;
      transition: background 80ms ease-out;
    }

    ul, ol {
      padding: 0;
      margin: 0 0 16px 0;
      list-style-position: outside;

      li {
        padding: 0;
        padding-top: 8px;
        margin: 0;
      }
    }

    ul {
      margin-left: 18px;
    }

    ol {
      margin-left: 25px;
    }

    strong {
      font-weight: 700;
    }

    .mention {
      color: ${mentionColor};
      font-weight: 400;
      overflow-wrap: normal;
      word-wrap: normal;
      word-break: normal;
      hyphens: auto;
      text-decoration: none;
      padding-left: 5px;
      padding-right: 5px;
      padding-top: 4px;
      padding-bottom: 4px;
      border-radius: 3px;
      background: ${transparentize(0.9, mentionColor)};
      transition: all 100ms ease;

      &:hover {
        color: ${darken(0.15, mentionColor)};
        text-decoration: none;
        background: ${transparentize(0.85, mentionColor)};
      }
    }

    .ql-align-right {
      text-align: right;
    }

    .ql-align-center {
      text-align: center;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    iframe {
      max-width: 100%;
    }

    [class^="ql-image-align-"],
    [class^="ql-iframe-align-"] {
      display: block;
      width: var(--resize-width, auto);
      max-width: 100%;
    }

    [class^="ql-image-align-"] > img {
      width: 100%;
      height: auto;
    }

    .ql-image-align-left,
    .ql-iframe-align-left {
      float: left;
      margin: 0 1em 1em 0;
    }

    .ql-image-align-center,
    .ql-iframe-align-center {
      margin-left: auto;
      margin-right: auto;
    }

    .ql-image-align-right,
    .ql-iframe-align-right {
      float: right;
      margin: 0 0 1em 1em;
    }

    .custom-button {
      padding: 10px 18px;
      display: inline-block;
      background-color: ${buttonColor};
      color: #fff;
      border-radius: 3px;
      text-decoration: none;
      font-size: ${fontSizes.m}px;
      font-weight: 400;
      line-height: normal;

      &:hover {
        color: #fff;
        text-decoration: none;
        background-color: ${darken(0.15, buttonColor)};
      }
    }
  `;
}

export interface MainThemeProps extends StylingConstsType {
  colors: {
    [key in Color]: string;
  };
  fontFamily: string;
  fontSizes: {
    [key in FontSizesType]: string;
  };
  isRtl: boolean;
}

// Main theme passed through any styled component
export function getTheme(tenant: any = null): MainThemeProps {
  const core = !isNilOrError(tenant) && tenant.data.attributes.settings.core;
  const fontFamily = get(
    tenant,
    'data.attributes.style.customFontName',
    'Public Sans'
  );

  return {
    colors: {
      ...colors,
      tenantPrimary: core ? core.color_main : '#ef0071',
      tenantSecondary: core ? core.color_secondary : '#000000',
      tenantText: core ? core.color_text : '#333333',
      // tenantPrimary variants to use for lightened/darkened variants
      // instead of using Polished library functions directly.
      tenantPrimaryLighten75: core
        ? transparentize(0.75, core.color_main)
        : transparentize(0.75, '#ef0071'),
      tenantPrimaryLighten95: core
        ? transparentize(0.95, core.color_main)
        : transparentize(0.95, '#ef0071'),
      tenantPrimaryLighten90: core
        ? transparentize(0.9, core.color_main)
        : transparentize(0.9, '#ef0071'),
    },
    fontFamily,
    fontSizes,
    ...get(tenant, 'data.attributes.style'),
    ...stylingConsts,
  };
}

export function invisibleA11yText() {
  /* See: https://snook.ca/archives/html_and_css/hiding-content-for-accessibility */
  return `
    position: absolute;
    height: 1px; width: 1px;
    overflow: hidden;
    clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
    clip: rect(1px, 1px, 1px, 1px);
  `;
}

// Calculus
export function remCalc(desiredSize: number) {
  return `${(desiredSize / fontSizes.s).toString().substring(0, 6).trim()}rem`;
}

export function calculateContrastRatio(
  backgroundColor: number[],
  textColor: number[]
) {
  function luminance(r: number, g: number, b: number) {
    const a: any = [r, g, b].map((val: number) => {
      let v = val;
      v /= 255;

      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  const contrastRatio =
    (luminance(backgroundColor[0], backgroundColor[1], backgroundColor[2]) +
      0.05) /
    (luminance(textColor[0], textColor[1], textColor[2]) + 0.05);

  return contrastRatio;
}

export function hexToRgb(hex: any) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
