import React from 'react';

import { FontWeight } from 'component-library/utils/typings';
import styled, { css } from 'styled-components';

import {
  MainThemeProps,
  colors,
  fontSizes,
  isRtl,
  Color,
  getFontWeightCSS,
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

type WordBreak = 'normal' | 'break-all' | 'keep-all' | 'break-word';

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
  wordBreak?: WordBreak;
  textShadow?: string;
  lineHeight?: string;
} & BoxMarginProps &
  BoxPaddingProps &
  BoxPositionProps &
  BoxZIndexProps &
  BoxHeightProps &
  BoxWidthProps &
  BoxDisplayProps &
  BoxOverflowProps &
  BoxVisibilityProps &
  React.HTMLAttributes<HTMLParagraphElement> &
  React.HTMLAttributes<HTMLElement>;

const StyledText = styled(Box)<BoxProps & TextProps>`
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
    wordBreak,
    textShadow,
    theme,
    lineHeight,
  }: TextProps & { theme: MainThemeProps }) => css`
    line-height: ${lineHeight ? lineHeight : '1.5'};
    color: ${color ? theme.colors[color] : colors.textPrimary};
    font-weight: ${getFontWeightCSS(fontWeight || 'normal')};
    font-style: ${fontStyle ? fontStyle : 'normal'};
    text-decoration: ${textDecoration ? textDecoration : 'none'};
    text-overflow: ${textOverflow ? textOverflow : 'clip'};
    white-space: ${whiteSpace ? whiteSpace : 'normal'};
    text-shadow: ${textShadow ? textShadow : 'none'};
    word-break: ${wordBreak ? wordBreak : 'normal'};
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
