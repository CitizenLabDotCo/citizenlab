import React from 'react';

import styled, { css } from 'styled-components';

import {
  MainThemeProps,
  colors,
  fontSizes,
  isRtl,
  Color,
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
  BoxProps,
} from '../Box';

type Variant = 'bodyL' | 'bodyM' | 'bodyS' | 'bodyXs';
type FontSize = keyof typeof fontSizes;
type FontWeight = 'bold' | 'normal';
type FontStyle = 'italic' | 'normal';
type TextDecoration = string;
type TextOverflow = 'ellipsis' | 'clip';
type WhiteSpace =
  | 'normal'
  | 'nowrap'
  | 'pre'
  | 'pre-wrap'
  | 'pre-line'
  | 'break-spaces';
type TextAlign =
  | 'left'
  | 'right'
  | 'center'
  | 'justify'
  | 'initial'
  | 'inherit';

export type TextProps = {
  variant?: Variant;
  color?: Color;
  fontSize?: FontSize;
  as?: 'p' | 'span' | 'blockquote' | 'ul' | 'ol' | 'li';
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  textDecoration?: TextDecoration;
  textOverflow?: TextOverflow;
  whiteSpace?: WhiteSpace;
  textAlign?: TextAlign;
} & BoxMarginProps &
  BoxPaddingProps &
  BoxPositionProps &
  BoxZIndexProps &
  BoxHeightProps &
  BoxWidthProps &
  BoxDisplayProps &
  BoxOverflowProps &
  BoxVisibilityProps &
  React.HTMLAttributes<HTMLParagraphElement>;

const StyledText = styled(Box)<BoxProps & TextProps>`
  line-height: 1.5;
  ${isRtl`direction: rtl;`}
  ${({
    variant,
    color,
    fontSize,
    fontWeight,
    fontStyle,
    textDecoration,
    textOverflow,
    whiteSpace,
    textAlign,
    theme,
  }: TextProps & { theme: MainThemeProps }) => css`
    color: ${color ? theme.colors[color] : colors.textPrimary};
    font-weight: ${fontWeight ? fontWeight : 'normal'};
    font-style: ${fontStyle ? fontStyle : 'normal'};
    text-decoration: ${textDecoration ? textDecoration : 'none'};
    text-overflow: ${textOverflow ? textOverflow : 'clip'};
    white-space: ${whiteSpace ? whiteSpace : 'normal'};
    ${textAlign ? `text-align: ${textAlign};` : ''}
    ${variant === 'bodyL'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.l}px;
          font-weight: ${fontWeight ? fontWeight : '600'};
        `
      : ''}
    ${variant === 'bodyM'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.m}px;
        `
      : ''}
    ${variant === 'bodyS'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.s}px;
        `
      : ''}
    ${variant === 'bodyXs'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.xs}px;
        `
      : ''}
  `}
`;

const Text: React.FC<TextProps> = ({
  children,
  variant = 'bodyM',
  color,
  as,
  fontSize,
  fontWeight,
  ...props
}) => {
  const mb = props.mb || props.my || props.m || '16px';

  return (
    <StyledText
      variant={variant}
      color={color}
      as={as || 'p'}
      fontSize={fontSize}
      fontWeight={fontWeight}
      mb={mb}
      {...props}
    >
      {children}
    </StyledText>
  );
};

export default Text;
