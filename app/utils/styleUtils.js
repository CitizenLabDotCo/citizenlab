import { css } from 'styled-components';

export const media = {
  smallPhone: (...args) => css`
    @media (max-width: 321px) {
      ${css(...args)}
    }
  `,
  phone: (...args) => css`
    @media (max-width: 480px) {
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
  desktop: (...args) => css`
    @media (min-width: 768px) {
      ${css(...args)}
    }
  `,
  smallerThanDesktop: (...args) => css`
    @media (max-width: 768px) {
      ${css(...args)}
    }
  `,
};
