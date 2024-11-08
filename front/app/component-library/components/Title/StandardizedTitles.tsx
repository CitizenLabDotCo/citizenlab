import React from 'react';

import { Color, FontSizesType } from 'component-library/utils/styleUtils';

import { BoxMarginProps, BoxPaddingProps } from '../Box';

import Title, { TextAlign } from '.';

type Props = {
  color?: Color;
  fontSize?: FontSizesType;
  textAlign?: TextAlign;
  className?: string;
  'data-testid'?: string;
  children: React.ReactNode;
} & BoxMarginProps &
  BoxPaddingProps &
  React.HTMLAttributes<HTMLHeadingElement>;

export const H1 = (props: Props) => <Title variant="h1" {...props} />;
export const H2 = (props: Props) => <Title variant="h2" {...props} />;
export const H3 = (props: Props) => <Title variant="h3" {...props} />;
export const H4 = (props: Props) => <Title variant="h4" {...props} />;
