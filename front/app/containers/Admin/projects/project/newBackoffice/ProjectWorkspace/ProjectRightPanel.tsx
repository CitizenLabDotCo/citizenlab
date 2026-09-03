import React from 'react';

import { Box, Button, Title } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ProjectRightPanel = () => {
  const { formatMessage } = useIntl();

  return (
    <Box p="20px" display="flex" flexDirection="column" gap="20px">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Title variant="h4" m="0">
          {formatMessage(messages.projectSetupPanel)}
        </Title>
        <Button buttonStyle="secondary-outlined" size="s" padding="4px 8px">
          {formatMessage(messages.projectSettings)}
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectRightPanel;
