import React from 'react';

// intl
import { injectIntl } from 'utils/cl-intl';

// Components
import ToolboxItem from './ToolboxItem';
import { Box } from '@citizenlab/cl2-component-library';

// Intl
import messages from '../../messages';

const ContentBuilderToolbox = () => {
  return (
    <Box w="100%" display="inline" marginTop="20px">
      <ToolboxItem label={messages.oneColumn} componentType={'Container'} />
      <ToolboxItem label={messages.text} componentType={'Text'} />
    </Box>
  );
};

export default injectIntl(ContentBuilderToolbox);
