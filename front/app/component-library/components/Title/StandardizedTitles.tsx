import React from 'react';

import { Color } from 'component-library/utils/styleUtils';

import { BoxMarginProps } from '../Box';

import Title from '.';

type Props = {
  color?: Color;
  children: React.ReactNode;
} & BoxMarginProps;

export const H1 = (props: Props) => <Title variant="h1" {...props} />;

export const H2 = (props: Props) => <Title variant="h2" {...props} />;

export const H3 = (props: Props) => <Title variant="h3" {...props} />;
