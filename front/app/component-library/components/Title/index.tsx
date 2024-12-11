import React from 'react';

import styled, { css } from 'styled-components';

import {
  Color,
  colors,
  fontSizes,
  isRtl,
  MainThemeProps,
} from '../../utils/styleUtils';
import Box, {
  BoxMarginProps,
  BoxPaddingProps,
  BoxPositionProps,
  BoxZIndexProps,
  BoxHeightProps,
  BoxWidthProps,
  BoxDisplayProps,
  BoxOverflowProps,
  BoxVisibilityProps,
} from '../Box';

export type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type FontSize = keyof typeof fontSizes;
export type FontWeight = 'bold' | 'normal' | 600;
type FontStyle = 'italic' | 'normal';
export type TextAlign =
  | 'left'
  | 'right'
  | 'center'
  | 'justify'
  | 'initial'
  | 'inherit';

export type TitleProps = {
  variant?: Variant;
  color?: Color;
  fontSize?: FontSize;
  as?: Variant;
  fontStyle?: FontStyle;
  textAlign?: TextAlign;
  fontWeight?: FontWeight;
} & BoxMarginProps &
  BoxPaddingProps &
  BoxPositionProps &
  BoxZIndexProps &
  BoxHeightProps &
  BoxWidthProps &
  BoxDisplayProps &
  BoxOverflowProps &
  BoxVisibilityProps &
  React.HTMLAttributes<HTMLHeadingElement>;

const StyledTitle = styled(Box)`
  ${isRtl`direction: rtl;`}

  ${({ variant, color, fontSize, fontStyle, textAlign }: TitleProps) => css`
    color: ${({ theme }: { theme: MainThemeProps }) =>
      color ? theme.colors[color] : colors.textPrimary};
    font-style: ${fontStyle ? fontStyle : 'normal'};
    font-weight: bold;
    line-height: 1.3;
    word-break: break-word;

    ${textAlign ? `text-align: ${textAlign};` : ''}
    ${variant === 'h1'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.xxxl}px;
        `
      : ''}
    ${variant === 'h2'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.xxl}px;
        `
      : ''}
    ${variant === 'h3'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.xl}px;
        `
      : ''}
    ${variant === 'h4'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.l}px;
        `
      : ''}
    ${variant === 'h5'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.m}px;
        `
      : ''}
    ${variant === 'h6'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.s}px;
        `
      : ''}
  `}
`;

const Title: React.FC<TitleProps> = ({
  children,
  variant = 'h1',
  color,
  as,
  fontSize,
  ...props
}) => {
  const mb = props.mb || props.my || props.m || '16px';

  return (
    <StyledTitle
      variant={variant}
      color={color}
      as={as || variant}
      fontSize={fontSize}
      mb={mb}
      {...props}
    >
      {children}
    </StyledTitle>
  );
};

export default Title;
