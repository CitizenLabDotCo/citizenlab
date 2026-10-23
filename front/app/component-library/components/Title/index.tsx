import React from 'react';

import { FontWeight } from 'component-library/utils/typings';
import styled, { css } from 'styled-components';

import { useGvInstance } from '../../utils/gvInstance';
import {
  Color,
  colors,
  fontSizes,
  getFontWeightCSS,
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
  React.HTMLAttributes<HTMLHeadingElement> &
  React.HTMLAttributes<HTMLElement>;

const StyledTitle = styled(Box)<TitleProps>`
  ${isRtl`direction: rtl;`}

  ${({
    variant,
    color,
    fontSize,
    fontStyle,
    textAlign,
    fontWeight,
  }: TitleProps) => css`
    color: ${({ theme }: { theme: MainThemeProps }) => {
      return color ? theme.colors[color] : colors.textPrimary;
    }};
    font-style: ${fontStyle ? fontStyle : 'normal'};
    font-weight: ${getFontWeightCSS(fontWeight || 'bold')};
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

// The props a designer may switch on one Title in the workbench, with the
// defaults the Title applies (utils/gvInstance.ts).
const INSTANCE_DEFAULTS = { variant: 'h1' as Variant };

const Title: React.FC<TitleProps> = (rawProps) => {
  const { props: instanceProps, tag } = useGvInstance(
    'Title',
    rawProps,
    INSTANCE_DEFAULTS
  );
  const {
    children,
    variant = INSTANCE_DEFAULTS.variant,
    color,
    as,
    fontSize,
    ...props
  } = instanceProps;
  const mb = props.mb || props.my || props.m || '16px';

  return (
    <StyledTitle
      {...tag}
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
