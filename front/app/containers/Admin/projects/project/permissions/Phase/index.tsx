import React from 'react';

import { Title, Text, Box, colors } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import ActionForms from './ActionForms';

const Phase = () => {
  const { phaseId } = useParams();
  if (!phaseId) return null;

  return (
    <Box mb="48px">
      <Title variant="h2" color="primary">
        <FormattedMessage {...messages.participationRequirementsTitle} />
      </Title>
      <Text color="coolGrey600" pb="8px">
        <FormattedMessage {...messages.participationRequirementsSubtitle} />
      </Text>
      <Box
        minHeight="100px"
        display="flex"
        flex={'1'}
        flexDirection="column"
        background={colors.white}
      >
        <Box mb="40px">
          <ActionForms phaseId={phaseId} />
        </Box>
      </Box>
    </Box>
  );
};

export default Phase;
