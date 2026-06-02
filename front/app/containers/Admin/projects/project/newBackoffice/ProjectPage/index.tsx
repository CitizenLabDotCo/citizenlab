import React from 'react';

import { Box, Title, Text, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const ProjectPage = () => {
  const { formatMessage } = useIntl();

  return (
    <Box p="24px" flexGrow={1} background={colors.background}>
      <Box background={colors.white} borderRadius="3px" p="24px">
        <Title variant="h3" mt="0">
          {formatMessage(messages.projectPageNav)}
        </Title>
        <Text color="textSecondary" m="0">
          {formatMessage(messages.projectPagePlaceholder)}
        </Text>
      </Box>
    </Box>
  );
};

export default ProjectPage;
