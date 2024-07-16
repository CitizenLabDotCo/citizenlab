import React from 'react';

import {
  Box,
  colors,
  useBreakpoint,
  Text,
} from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

import InitiativesCTABox from 'containers/HomePage/InitiativesCTABox';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Proposals = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const postingPermission = useInitiativesPermissions('posting_initiative');
  const postingProposalsEnabled = !!postingPermission?.enabled;
  const hasProposalsEnabled = useFeatureFlag({
    name: 'initiatives',
  });
  const proposalsEnabled = postingProposalsEnabled && hasProposalsEnabled;

  if (!proposalsEnabled) return null;
  return (
    <Box bg={colors.background} data-cy="e2e-proposals">
      <Box
        maxWidth="1200px"
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
  const { formatMessage } = useIntl();
  return (
    <Box
      background="#ffffff"
      my="20px"
      display="flex"
      flexDirection="column"
      gap="16px"
    >
      <Text color="textSecondary">
        {formatMessage(messages.proposalsDescription)}
      </Text>
    </Box>
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
