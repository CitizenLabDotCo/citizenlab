import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import OriginalLink from 'utils/cl-router/Link';

type LinkProps = Parameters<typeof OriginalLink>[0] & { color?: string };

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

const Link: typeof OriginalLink = ((props: LinkProps) => {
  const { color = colors.black, ...rest } = props;
  return <StyledLink {...rest} color={color} />;
}) as typeof OriginalLink;

export default Link;
