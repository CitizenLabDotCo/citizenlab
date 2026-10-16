import React from 'react';

import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

// Tells the reader of a question, or of its answer, that the answer stays
// between the participant and the project managers.
const ManagersOnlyAnswerNote = () => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="8px"
      my="8px"
      data-cy="e2e-private-answer-note"
    >
      <Icon
        name="lock"
        width="16px"
        height="16px"
        fill={theme.colors.tenantPrimary}
      />
      <Text m="0px" fontSize="s" color="tenantPrimary">
        <FormattedMessage {...messages.managersOnly} />
      </Text>
    </Box>
  );
};

export default ManagersOnlyAnswerNote;
