import React from 'react';

import {
  Box,
  colors,
  useBreakpoint,
  Text,
  defaultCardStyle,
  media,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
  ${defaultCardStyle};

  ${media.tablet`
    padding: 60px 50px 50px;
  `}

  ${media.phone`
    flex-direction: column;
    align-items: flex-start;
    padding: 60px 30px 40px;
  `}
`;

const Highlight = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');

  return (
    <Box bg={colors.background} data-cy="e2e-highlight">
      <Box
        maxWidth="1200px"
        margin="0 auto"
        pt={isSmallerThanTablet ? DEFAULT_PADDING : '40px'}
        pb={isSmallerThanTablet ? DEFAULT_PADDING : '40px'}
        px={isSmallerThanTablet ? DEFAULT_PADDING : '0px'}
      >
        <Container />
      </Box>
    </Box>
  );
};

const HighlightSettings = () => {
  const { formatMessage } = useIntl();
  return (
    <Box
      background="#ffffff"
      my="20px"
      display="flex"
      flexDirection="column"
      gap="16px"
    >
      <Text color="textSecondary">hi</Text>
    </Box>
  );
};

Highlight.craft = {
  related: {
    settings: HighlightSettings,
  },
  custom: {
    title: messages.highlightTitle,
    noPointerEvents: true,
  },
};

export default Highlight;
