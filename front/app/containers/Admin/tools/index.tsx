import React from 'react';
import { Box, Title } from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import Workshops from './Workshops';
import Widget from './Widget';
import PublicAPI from './PublicAPI';

export const ToolsPage = () => {
  const { formatMessage } = useIntl();

  return (
    <Box width="100%" display="flex" justifyContent="center">
      <Box maxWidth="800px">
        <Title color="primary">{formatMessage(messages.tools)}</Title>
        <Workshops />
        <Widget />
        <PublicAPI />
      </Box>
    </Box>
  );
};

export default ToolsPage;
