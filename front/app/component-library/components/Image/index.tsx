import React from 'react';

import styled, { css } from 'styled-components';

import Box, {
  BoxColorProps,
  BoxPaddingProps,
  BoxMarginProps,
  BoxHeightProps,
  BoxWidthProps,
  BoxDisplayProps,
  BoxOverflowProps,
  BoxPositionProps,
  BoxBorderProps,
  BoxVisibilityProps,
  BoxZIndexProps,
} from '../Box';

export type ImageProps = {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  srcSet?: string;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
} & BoxColorProps &
  BoxPaddingProps &
  BoxMarginProps &
  BoxHeightProps &
  BoxWidthProps &
  BoxDisplayProps &
  BoxOverflowProps &
  BoxPositionProps &
  BoxBorderProps &
  BoxVisibilityProps &
  BoxZIndexProps &
  React.HTMLAttributes<HTMLImageElement> &
  React.HTMLAttributes<HTMLElement>;

const StyledImage = styled(Box)<ImageProps>`
  // objectFit
  ${({ objectFit }) => css`
    ${objectFit ? `object-fit: ${objectFit}` : ''};
  `}
`;

export const Image: React.FC<ImageProps> = (props) => {
  const { alt, children, ...rest } = props;
  return (
    <StyledImage as="img" alt={alt} {...rest}>
      {children}
    </StyledImage>
  );
};

export default Image;
