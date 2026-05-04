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

// Internal props are intentionally loose: the public signature comes from
// `: typeof OriginalLink` on the export, which preserves typed-route checking
// at the call site.
const Link: typeof OriginalLink = ((
  props: { color?: string } & Record<string, unknown>
) => {
  const { color = colors.black, ...rest } = props as {
    color?: string;
  } & Record<string, unknown>;
  const StyledLinkAny = StyledLink as unknown as React.ComponentType<{
    color: string;
    [key: string]: unknown;
  }>;
  return <StyledLinkAny {...rest} color={color} />;
}) as typeof OriginalLink;

export default Link;
