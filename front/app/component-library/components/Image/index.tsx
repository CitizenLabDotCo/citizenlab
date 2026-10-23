import React from 'react';

import styled, { css } from 'styled-components';

import { useGvInstance } from '../../utils/gvInstance';
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

// The props a designer may switch on one Image in the workbench; it has no
// default fit (utils/gvInstance.ts).
const INSTANCE_DEFAULTS: Partial<ImageProps> = { objectFit: undefined };

export const Image: React.FC<ImageProps> = (rawProps) => {
  const { props, tag } = useGvInstance('Image', rawProps, INSTANCE_DEFAULTS);
  const { alt, children, ...rest } = props;
  return (
    <StyledImage {...tag} as="img" alt={alt} {...rest}>
      {children}
    </StyledImage>
  );
};

export default Image;
