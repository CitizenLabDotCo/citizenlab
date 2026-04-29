import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import OriginalLink from 'utils/cl-router/Link';

const StyledLink = styled(OriginalLink)<{
  color: string;
}>`
  font-size: ${fontSizes.base}px;
  color: ${({ color }) => color};

  &:hover {
    color: ${({ color }) => color};
    text-decoration: underline;
  }
` as typeof OriginalLink;

const Link: typeof OriginalLink = (props: any) => {
  const { color = colors.black, ...rest } = props;
  return <StyledLink {...rest} color={color} />;
};

export default Link;
