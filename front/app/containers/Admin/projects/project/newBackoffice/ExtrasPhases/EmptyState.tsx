import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { ExampleRow } from '../phaseRowUtils';

const EmptyState = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Text m="0 0 4px 0" px="10px" fontSize="s" color="textSecondary">
        {formatMessage(messages.extrasEmptyDescription)}
      </Text>
      <Box display="flex" flexDirection="column">
        <ExampleRow>
          {formatMessage(messages.exampleSurveySchoolRunTravel)} ·{' '}
          {formatMessage(messages.ongoing)}
        </ExampleRow>
        <ExampleRow>
          {formatMessage(messages.exampleSurveyMobilityCheckIn)} ·{' '}
          {formatMessage(messages.ongoing)}
        </ExampleRow>
      </Box>
    </>
  );
};

export default EmptyState;
