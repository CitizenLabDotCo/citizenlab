import React from 'react';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import messages from '../../../messages';
import InitiativesCTABox from 'containers/HomePage/InitiativesCTABox';

const Proposals = () => {
  return (
    <Box bg={colors.background}>
      <Box maxWidth="1150px" margin="0 auto">
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
