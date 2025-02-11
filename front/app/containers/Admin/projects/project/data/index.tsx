import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { SectionDescription, SectionTitle } from 'components/admin/Section';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import ResetParticipationData from './ResetParticipationData';

const Data = () => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <SectionTitle>{formatMessage(messages.dataTitle)}</SectionTitle>
      <SectionDescription>
        {formatMessage(messages.dataDescription)}
      </SectionDescription>
      <ResetParticipationData />
    </Box>
  );
};

export default Data;
