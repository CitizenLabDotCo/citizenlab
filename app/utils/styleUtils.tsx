import { isNil, get, isString } from 'lodash-es';
import { ITenant } from 'services/tenant';
import { css } from 'styled-components';
import { darken, transparentize } from 'polished';
import { isNilOrError } from './helperUtils';

// Media
export const viewportWidths = {
  smallPhone: 320,
  phone: 360,
  largePhone: 415,
  smallTablet: 767,
  largeTablet: 1023
};

export const media = {
  smallPhone: (style: any, ...args) => css`
    @media (max-width: ${viewportWidths.smallPhone}px) {
      ${css(style, ...args)}
    }
  `,
  phone: (style: any, ...args) => css`
    @media (max-width: ${viewportWidths.phone}px) {
      ${css(style, ...args)}
    }
  `,
  largePhone: (style: any, ...args) => css`
    @media (max-width: ${viewportWidths.largePhone}px) {
      ${css(style, ...args)}
    }
  `,
  biggerThanPhone: (style: any, ...args) => css`
    @media (min-width: ${viewportWidths.phone}px) {
      ${css(style, ...args)}
    }
  `,
  biggerThanLargePhone: (style: any, ...args) => css`
    @media (min-width: ${viewportWidths.largePhone}px) {
      ${css(style, ...args)}
    }
  `,
  tablet: (style: any, ...args) => css`
    @media (min-width: ${viewportWidths.smallTablet}px) and (max-width: 1113px) {
      ${css(style, ...args)}
    }
  `,
  tabletLandscape: (style: any, ...args) => css`
    @media (min-width: ${viewportWidths.smallTablet}px) and (max-width: ${viewportWidths.largeTablet + 1}px) and (orientation : landscape) {
      ${css(style, ...args)}
    }
  `,
  tabletPortrait: (style: any, ...args) => css`
    @media (min-width: ${viewportWidths.smallTablet}px) and (max-width: ${viewportWidths.largeTablet + 1}px) and (orientation : portrait) {
      ${css(style, ...args)}
    }
  `,
  smallerThanMinTablet: (style: any, ...args) => css`
    @media (max-width: ${viewportWidths.smallTablet}px) {
      ${css(style, ...args)}
    }
  `,
  biggerThanMinTablet: (style: any, ...args) => css`
    @media (min-width: ${viewportWidths.smallTablet}px) {
      ${css(style, ...args)}
    }
  `,
  smallerThanMaxTablet: (style: any, ...args) => css`
    @media (max-width: ${viewportWidths.largeTablet}px) {
      ${css(style, ...args)}
    }
  `,
  biggerThanMaxTablet: (style: any, ...args) => css`
    @media (min-width: ${viewportWidths.largeTablet + 1}px) {
      ${css(style, ...args)}
    }
  `,
  smallerThan1280px: (style: any, ...args) => css`
    @media (max-width: 1280px) {
      ${css(style, ...args)}
    }
  `,
  smallerThan1200px: (style: any, ...args) => css`
    @media (max-width: 1200px) {
      ${css(style, ...args)}
    }
  `,
  smallerThan1100px: (style: any, ...args) => css`
    @media (max-width: 1100px) {
      ${css(style, ...args)}
    }
  `,
  smallDesktop: (style: any, ...args) => css`
    @media (min-height: 600px) and (max-width: 1280px) {
      ${css(style, ...args)}
    }
  `,
  desktop: (style: any, ...args) => css`
    @media (min-height: 800px) and (min-width: 1280px) {
      ${css(style, ...args)}
    }
  `,
};

export const colors = {
  background: '#f2f3f4',
  text: '#333',
  secondaryText: '#84939E',
  label: '#596B7A',
  placeholder: '#999',
  separation: '#e0e0e0',

  // default input element border colors
  border: '#999',
  hoveredBorder: '#333',
  focussedBorder: '#333',

  /**
  * this is the first grey to get 3.0 contrast ratio on a white background, needed for non-text contrast such as button/label borders
  */
  separationDark: '#949494',
  /**
  * first grey to get 3.0 contrast ratio on the beige/greyish background color we use (#F4F4F5)
  */
  separationDarkOnGreyBackground: '#8D8D8D',
  /**
  * first grey to get 3.0 contrast ratio on the beige/greyish background color we use (#F4F4F5)
  */
  clGreyOnGreyBackground: '#707070',
  /**
  * background color of dropdown items (e.g. in the navbar)
  */
  clDropdownHoverBackground: '#e9e9e9',
  /**
  * Green that has a contrast ratio of >=4.5 on a white background
  */
  clGreen: '#04884C',
  /**
  * darker green than clGreen for when we have a light green background (clGreenSuccessBackground)
  */
  clGreenSuccess: '#008040',
  clGreenSuccessBackground: '#e4f7ef',
  /**
  * Red that has a contrast ratio of >=4.5 on a white background
  */
  clRed: '#E52516',
  clRed2: '#FC3C2D',
  /**
  * darker red than clRed for when we have a light red background (clRedErrorBackground)
  */
  clRedError: '#D61607',
  clRedErrorBackground: '#fde9e8',
  draftYellow: '#8C680D',
  grey: '#767676',
  mediumGrey: '#BDBDBD',
  lightGreyishBlue: '#EBEDEF',
  clBlue: '#008292',
  clBlueDark: '#147985',
  clBlueDarkBg: 'rgba(0, 128, 160, 0.13)',
  clBlueDarker: '#0A5159',
  clBlueDarkest: '#02282D',
  clBlueLightest: '#BEE7EB',
  clBlueLighter: '#80CFD8',
  clBlueLight: '#40B8C5',
  placeholderBg: '#CFD6DB',
  /** Dark background color for popovers, tooltips, dropdown menus, ... */
  popoverDarkBg: '#2D2D2D',
  /** Foreground (text) color for dark popovers, tooltip, dropdown menus , ... */
  popoverDarkFg: '#CBCBCB',
  // Admin colors
  adminBackground: '#F0F3F4',
  adminContentBackground: '#fff',
  adminMenuBackground: '#003349',
  adminDarkestBackground: 'rgba(0, 0, 0, 0.75)',

  adminTextColor: '#044D6C',
  adminLightText: 'rgba(255, 255, 255, 0.8)',
  adminSecondaryTextColor: '#596B7A',

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
  twitter: '#1ea4f2',
  emailText: '#004d6c',
  emailBg: '#e6ebec',

  // buttons
  disabledPrimaryButtonBg: '#cfcfcf',
  clBlueButtonText: '#1391A1'
};

export const fontSizes = {
  xs: 12,
  small: 14,
  base: 16,
  medium: 17,
  large: 18,
  xl: 21,
  xxl: 25,
  xxxl: 30,
  xxxxl: 34,
  xxxxxl: 42
};

export const defaultStyles = {
  boxShadow: '0px 1.5px 2px 0px rgba(0, 0, 0, 0.1)',
  boxShadowHover:
    '0px 7.4px 15.4px 0px rgba(0, 0, 0, 0.112), 0px 2.2px 4.6px 0px rgba(0, 0, 0, 0.088)',
  borderColorFocused: colors.label,
  boxShadowFocused: `0px 0px 0px 1px ${colors.label}`,
  inputPadding: '12px'
};

export const defaultCardStyle = css`
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: ${defaultStyles.boxShadow};
`;

export const defaultCardHoverStyle = css`
  transition: all 150ms ease-out;

  &:hover {
    box-shadow: ${defaultStyles.boxShadowHover};
    transform: translate(0px, -2px);
  }
`;

export const defaultOutline = css`
  border-color: ${defaultStyles.borderColorFocused};
  box-shadow: ${defaultStyles.boxShadowFocused};
`;

export const defaultInputStyle = css`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  padding: ${defaultStyles.inputPadding};
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px ${colors.border};
  background: #fff;
  cursor: text;
  outline: none;
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  transition: box-shadow 65ms ease-out, border-color 65ms ease-out;

  &:not(:disabled):not(.disabled) {
    &:not(.error):hover,
    &:not(.error).hover {
      border-color: ${colors.hoveredBorder};
    }

    &:not(.error):focus,
    &:not(.error).focus {
      ${defaultOutline};
    }

    &.error {
      border-color: ${colors.clRedError};

      &:focus,
      &.focus {
        box-shadow: 0px 0px 0px 1px ${colors.clRedError};
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
`;

export const stylingConsts = {
  menuHeight: 78,
  mobileMenuHeight: 72,
  mobileTopBarHeight: 66,
  footerHeight: 60,
  maxPageWidth: 952,
  bannerWidth: 1340,
  pageWidth: 1150,
  textWidth: 720,
  borderRadius: '3px'
};

// Reusable text styling
export function quillEditedContent(
  buttonColor = colors.clBlueDark,
  linkColor = colors.clBlueDark,
  textColor = colors.text,
  mentionColor = colors.text,
  fontSize: 'small' | 'base' | 'medium' | 'large' = 'base',
  fontWeight: 300 | 400 = 400,
) {
  let lineHeight = 25;

  if (fontSize === 'medium') {
    lineHeight = 27;
  } else if (fontSize === 'large') {
    lineHeight = 29;
  }

  const defaultFontStyle = `
    color: ${textColor};
    font-size: ${fontSizes[fontSize]}px;
    font-weight: ${fontWeight};
    line-height: ${lineHeight}px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  `;

  return`
    ${defaultFontStyle}

    a, li, p {
      ${defaultFontStyle}
    }

    &:after {
      content: "";
      display: table;
      clear: both;
    }

    h2 {
      font-size: ${fontSizes.xxxl - 2}px;
      line-height: 33px;
      font-weight: 500;
      padding: 0;
      margin: 0;
      margin-bottom: 20px;
    }

    h3 {
      font-size: ${fontSizes.xxl - 2}px;
      line-height: 31px;
      font-weight: 500;
      padding: 0;
      margin: 0;
      margin-top: 5px;
      margin-bottom: 15px;
    }

    p {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0px;
      }
    }

    a {
      color: ${linkColor};
      text-decoration: underline;
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-all;
      word-break: break-word;
      hyphens: auto;

      &:hover {
        color: ${darken(0.15, linkColor)};
        text-decoration: underline;
      }
    }

    ul, ol {
      padding: 0;
      margin: 0;
      list-style-position: outside;
      margin-bottom: 24px;

      li {
        padding: 0;
        padding-top: 8px;
        margin: 0;
      }
    }

    ul  {
      margin-left: 17px;
    }

    ol {
      margin-left: 15px;
    }

    strong {
      font-weight: 600;
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

    .custom-button {
      padding: 11px 22px;
      display: inline-block;
      background-color: ${buttonColor};
      color: white;
      border-radius: 3px;
      text-decoration: none;
      font-size: ${fontSizes.large}px;
      font-weight: normal;
      line-height: 24px;

      &:hover {
        text-decoration: none;
        color: white;
      }
    }
  `;
}

// Main theme passed through any styled component
export function getTheme(tenant: ITenant | null) {
  const core = !isNilOrError(tenant) && tenant.data.attributes.settings.core;
  const fontFamily = get(tenant, 'data.attributes.style.customFontName', 'larsseit');
  const signedOutHeaderOverlayOpacity = get(tenant, 'data.attributes.style.signedOutHeaderOverlayOpacity');
  const signedInHeaderOverlayOpacity = get(tenant, 'data.attributes.style.signedInHeaderOverlayOpacity');

  return ({
    colors,
    fontFamily,
    fontSizes,
    colorMain: (core ? core.color_main : '#ef0071'),
    colorSecondary: (core ? core.color_secondary : '#000000'),
    colorText: (core ? core.color_text : '#000000'),
    ...get(tenant, 'data.attributes.style'),
    signedOutHeaderOverlayOpacity: (!isNil(signedOutHeaderOverlayOpacity) ? signedOutHeaderOverlayOpacity / 100.0 : 0.9),
    signedInHeaderOverlayOpacity: (!isNil(signedInHeaderOverlayOpacity) ? signedInHeaderOverlayOpacity / 100.0 : 0.9),
    ...stylingConsts
  });
}

// Utils
export function booleanClass(value: any, className: string | undefined) {
  if (!!value && isString(className)) {
    return ` ${className}`;
  }

  return '';
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
