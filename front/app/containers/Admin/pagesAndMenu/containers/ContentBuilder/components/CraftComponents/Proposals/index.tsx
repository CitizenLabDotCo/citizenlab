import React from 'react';

// components
import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import messages from '../../../messages';
import InitiativesCTABox from 'containers/HomePage/InitiativesCTABox';
import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

const Proposals = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  return (
    <Box bg={colors.background}>
      <Box
        maxWidth="1150px"
        margin="0 auto"
        pt={isSmallerThanTablet ? DEFAULT_PADDING : '40px'}
        pb={isSmallerThanTablet ? DEFAULT_PADDING : '40px'}
        px={isSmallerThanTablet ? DEFAULT_PADDING : '0px'}
      >
        <InitiativesCTABox />
      </Box>
    </Box>
  );
};

const ProposalsSettings = () => {
  return (
    <Box
      background="#ffffff"
      my="40px"
      display="flex"
      flexDirection="column"
      gap="16px"
    />
  );
};

Proposals.craft = {
  related: {
    settings: ProposalsSettings,
  },
  custom: {
    title: messages.proposalsTitle,
    noPointerEvents: true,
  },
};

export default Proposals;
