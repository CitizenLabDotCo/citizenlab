import { css } from 'styled-components';

export const media = {
  smallPhone: (...args) => css`
    @media (max-width: 321px) {
      ${css(...args)}
    }
  `,
  phone: (...args) => css`
    @media (max-width: 481px) {
      ${css(...args)}
    }
  `,
  biggerThanPhone: (...args) => css`
    @media (min-width: 481px) {
      ${css(...args)}
    }
  `,
  tablet: (...args) => css`
    @media (min-width: 481px) and (max-width: 767px) {
      ${css(...args)}
    }
  `,
  smallerThanMinTablet: (...args) => css`
    @media (max-width: 481px) {
      ${css(...args)}
    }
  `,
  smallerThanMaxTablet: (...args) => css`
    @media (max-width: 767px) {
      ${css(...args)}
    }
  `,
  biggerThanMaxTablet: (...args) => css`
    @media (min-width: 767px) {
      ${css(...args)}
    }
  `,
};

export const colors = {
  clBlue: '#01A1B1',
  text: '#222',
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
