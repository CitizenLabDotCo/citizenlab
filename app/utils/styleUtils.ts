import { css } from 'styled-components';

export const media = {
  smallPhone: (style: any, ...args) => css`
    @media (max-width: 321px) {
      ${css(style, ...args)}
    }
  `,
  phone: (style: any, ...args) => css`
    @media (max-width: 481px) {
      ${css(style, ...args)}
    }
  `,
  biggerThanPhone: (style: any, ...args) => css`
    @media (min-width: 481px) {
      ${css(style, ...args)}
    }
  `,
  tablet: (style: any, ...args) => css`
    @media (min-width: 481px) and (max-width: 767px) {
      ${css(style, ...args)}
    }
  `,
  smallerThanMinTablet: (style: any, ...args) => css`
    @media (max-width: 481px) {
      ${css(style, ...args)}
    }
  `,
  biggerThanMinTablet: (style: any, ...args) => css`
    @media (min-width: 481px) {
      ${css(style, ...args)}
    }
  `,
  smallerThanMaxTablet: (style: any, ...args) => css`
    @media (max-width: 767px) {
      ${css(style, ...args)}
    }
  `,
  biggerThanMaxTablet: (style: any, ...args) => css`
    @media (min-width: 767px) {
      ${css(style, ...args)}
    }
  `,
  smallerThanDesktop: (style: any, ...args) => css`
    @media (max-width: 1024px) {
      ${css(style, ...args)}
  }
  `,
  biggerThanDesktop: (style: any, ...args) => css`
    @media(min-width: 1024px) {
      ${ css(style, ...args) }
    }
  `,
};

export function remCalc(desiredSize: number) {
  return `${(desiredSize / fontSizes.small).toString().substring(0, 6).trim()}rem`;
}

export const colors = {
  clBlue: '#01A1B1',
  text: '#222222',
  title: '#0E0E0E',
  darkClGreen: '#004949',
  success: '#32B67A',
  error: '#FC3C2D',
  label: '#84939E',
  mediumGrey: '#BDBDBD',
  separation: '#EAEAEA',
  background: '#F8F8F8',
  adminBackground: '#F0F3F4',
  clBlueDarkest: '#02282D',
  clBlueDarker: '#0A5159',
  clBlueDark: '#147985',
  clBlueLightest: '#BEE7EB',
  clBlueLighter: '#80CFD8',
  clBlueLight: '#40B8C5',
  placeholderBg: '#cfd6db',
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
