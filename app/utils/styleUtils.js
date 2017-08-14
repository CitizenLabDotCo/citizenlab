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
  notPhone: (...args) => css`
    @media (min-width: 481px) {
      ${css(...args)}
    }
  `,
  tablet: (...args) => css`
    @media (min-width: 481px) and (max-width: 767px) {
      ${css(...args)}
    }
  `,
  desktop: (...args) => css`
    @media (min-width: 768px) {
      ${css(...args)}
    }
  `,
};
