import React from 'react';

import { FontWeight } from 'component-library/utils/typings';
import styled, { css } from 'styled-components';

import {
  MainThemeProps,
  bo,
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

type Variant =
  | 'bodyL'
  | 'bodyM'
  | 'bodyS'
  | 'bodyXs'
  | 'bo-section'
  | 'bo-label'
  | 'bo-helper'
  | 'bo-micro';

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

type Role = {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  color: string;
};

// The back office type hierarchy. Unlike the body variants, a role also pins
// the weight and the colour: https://govocal.augur.page/ux-ui-audit/design-system/#type
const BO_ROLES: Partial<Record<Variant, Role>> = {
  'bo-section': {
    fontSize: fontSizes.s,
    fontWeight: 500,
    lineHeight: 1.4,
    color: bo.colors.textHeadingStrong,
  },
  'bo-label': {
    fontSize: fontSizes.s,
    fontWeight: 400,
    lineHeight: 1.4,
    color: bo.colors.textHeading,
  },
  'bo-helper': {
    fontSize: fontSizes.s,
    fontWeight: 400,
    lineHeight: 1.4,
    color: colors.coolGrey600,
  },
  'bo-micro': {
    fontSize: fontSizes.xs,
    fontWeight: 400,
    lineHeight: 1.4,
    color: colors.coolGrey600,
  },
};

const roleCSS = ({
  variant,
  color,
  fontSize,
  fontWeight,
  lineHeight,
  theme,
}: TextProps & { theme: MainThemeProps }) => {
  const role = variant ? BO_ROLES[variant] : undefined;
  if (!role) return '';

  return `
    font-size: ${fontSize ? fontSizes[fontSize] : role.fontSize}px;
    font-weight: ${fontWeight ? getFontWeightCSS(fontWeight) : role.fontWeight};
    line-height: ${lineHeight || role.lineHeight};
    color: ${color ? theme.colors[color] : role.color};
  `;
};

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
    ${roleCSS({ variant, color, fontSize, fontWeight, lineHeight, theme })}
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
  // A back office role brings its own spacing; the body variants keep theirs.
  const role = BO_ROLES[variant];
  const mb = props.mb || props.my || props.m || (role ? '0' : '16px');

  return (
    <StyledText
      variant={variant}
      color={color}
      as={as || 'p'}
      fontSize={fontSize}
      fontWeight={fontWeight}
      m={role ? '0' : undefined}
      mb={mb}
      {...props}
    >
      {children}
    </StyledText>
  );
};

export default Text;
