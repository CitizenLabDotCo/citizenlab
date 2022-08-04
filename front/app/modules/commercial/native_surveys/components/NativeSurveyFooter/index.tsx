import React from 'react';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const NativeSurveyFooter = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      paddingY="12px"
      background="white"
      width="100%"
      borderTop={`1px solid ${colors.separation}`}
    >
      <Box display="flex" width="632px">
        <Button width="auto" type="submit">
          <FormattedMessage {...messages.submitSurvey} />
        </Button>
      </Box>
    </Box>
  );
};

export default NativeSurveyFooter;
