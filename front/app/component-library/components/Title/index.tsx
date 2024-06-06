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

type StyleVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type FontSize = keyof typeof fontSizes;
type FontWeight = 'bold' | 'normal';
type FontStyle = 'italic' | 'normal';
type TextAlign =
  | 'left'
  | 'right'
  | 'center'
  | 'justify'
  | 'initial'
  | 'inherit';

export type TitleProps = {
  styleVariant?: StyleVariant;
  color?: Color;
  fontSize?: FontSize;
  as?: StyleVariant;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
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
  React.HTMLAttributes<HTMLHeadingElement>;

const StyledTitle = styled(Box)`
  line-height: 1.3;

  ${isRtl`direction: rtl;`}

  ${({
    styleVariant,
    color,
    fontSize,
    fontWeight,
    fontStyle,
    textAlign,
  }: TitleProps) => css`
    color: ${({ theme }: { theme: MainThemeProps }) =>
      color ? theme.colors[color] : colors.textPrimary};
    font-weight: ${fontWeight ? fontWeight : 'bold'};
    font-style: ${fontStyle ? fontStyle : 'normal'};

    ${textAlign ? `text-align: ${textAlign};` : ''}
    ${styleVariant === 'h1'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.xxxl}px;
        `
      : ''}
    ${styleVariant === 'h2'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.xxl}px;
        `
      : ''}
    ${styleVariant === 'h3'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.xl}px;
        `
      : ''}
    ${styleVariant === 'h4'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.l}px;
        `
      : ''}
    ${styleVariant === 'h5'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.m}px;
        `
      : ''}
    ${styleVariant === 'h6'
      ? `
          font-size: ${fontSize ? fontSizes[fontSize] : fontSizes.s}px;
        `
      : ''}
  `}
`;

const Title: React.FC<TitleProps> = ({
  children,
  styleVariant = 'h1',
  color,
  as,
  fontSize,
  fontWeight,
  ...props
}) => {
  const mb = props.mb || props.my || props.m || '16px';

  return (
    <StyledTitle
      styleVariant={styleVariant}
      color={color}
      as={as || styleVariant}
      fontSize={fontSize}
      fontWeight={fontWeight}
      mb={mb}
      {...props}
    >
      {children}
    </StyledTitle>
  );
};

export default Title;
