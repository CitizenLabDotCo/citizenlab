import React from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import Warning from 'components/UI/Warning';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

const isHomepageBuilder = (pathname: string) => {
  return pathname.includes('/homepage-builder');
};

interface Props {
  title: string;
  explanation: MessageDescriptor;
}

// Only show this if we are in homepage builder
const EmptyState = ({ title, explanation }: Props) => {
  const location = useLocation();
  const isSmallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();

  if (isHomepageBuilder(location.pathname)) {
    return (
      <Box
        px={isSmallerThanPhone ? undefined : DEFAULT_PADDING}
        py={DEFAULT_PADDING}
        w="100%"
        display="flex"
        justifyContent="center"
      >
        <Box w="100%" maxWidth="1200px">
          <Title
            variant="h3"
            mt="0px"
            ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
          >
            {title}
          </Title>
          <Warning>{formatMessage(explanation)}</Warning>
        </Box>
      </Box>
    );
  }

  return null;
};

export default EmptyState;
