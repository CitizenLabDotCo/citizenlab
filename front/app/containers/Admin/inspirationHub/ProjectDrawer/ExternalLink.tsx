import React from 'react';

import {
  Box,
  BoxProps,
  Icon,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { trackEventByName } from 'utils/analytics';

import tracks from './tracks';

const StyledBox = styled(Box)`
  text-decoration: none;
  font-weight: bold;
  font-size: ${fontSizes.m}px;

  &:hover {
    text-decoration: underline;
  }
`;

type Props = BoxProps & Omit<React.HTMLProps<HTMLAnchorElement>, 'ref' | 'as'>;

const ExternalLink = ({ children, ...props }: Props) => {
  return (
    <StyledBox
      as="a"
      color={colors.textPrimary}
      target="_blank"
      display="flex"
      flexDirection="row"
      alignItems="center"
      onClick={() => {
        trackEventByName(tracks.otherPlatformClickthrough, {
          href: props.href,
        });
      }}
      {...props}
    >
      {children}
      <Icon
        name="open-in-new"
        width="16px"
        m="0"
        ml="4px"
        fill={colors.textSecondary}
      />
    </StyledBox>
  );
};

export default ExternalLink;
