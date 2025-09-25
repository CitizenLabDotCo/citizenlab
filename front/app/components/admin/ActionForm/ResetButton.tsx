import React from 'react';

import { Box, Button, fontSizes } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onClick: () => void;
}

const ResetButton = ({ onClick }: Props) => {
  return (
    <Box mt="28px" w="100%" display="flex">
      <Button
        width="auto"
        buttonStyle="text"
        onClick={onClick}
        padding="0px"
        fontSize={`${fontSizes.m}px`}
      >
        <span style={{ textDecorationLine: 'underline' }}>
          <FormattedMessage {...messages.resetDemographicQuestionsAndGroups} />
        </span>
      </Button>
    </Box>
  );
};

export default ResetButton;
