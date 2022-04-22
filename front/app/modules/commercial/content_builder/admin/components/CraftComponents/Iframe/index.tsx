import React from 'react';

// components
import { Box, Input } from '@citizenlab/cl2-component-library';

// Intl
import messages from '../../../messages';
import { injectIntl } from 'utils/cl-intl';

// craft
import { useNode } from '@craftjs/core';

const CraftIframe = ({ embedCode, height }) => {
  // Insert height and width into the <iframe>
  console.log(height);

  return (
    <Box minHeight="26px">
      <div dangerouslySetInnerHTML={{ __html: embedCode }} />
    </Box>
  );
};

const CraftIframeSettings = injectIntl(({ intl: { formatMessage } }) => {
  const {
    actions: { setProp },
    embedCode,
    height,
  } = useNode((node) => ({
    embedCode: node.data.props.embedCode,
    height: node.data.props.height,
  }));

  return (
    <Box marginBottom="20px">
      <Input
        label={formatMessage(messages.embedCodeLabel)}
        placeholder={formatMessage(messages.embedCodePlaceholder)}
        type="text"
        value={embedCode}
        onChange={(value) => {
          setProp((props) => (props.embedCode = value));
        }}
      />
      <Input
        label={formatMessage(messages.embedHeightLabel)}
        placeholder={formatMessage(messages.embedHeightPlaceholder)}
        type="text"
        value={height}
        onChange={(value) => {
          setProp((props) => (props.height = value));
        }}
      />
    </Box>
  );
});

CraftIframe.craft = {
  props: {
    embedCode: '',
    height: '',
  },
  related: {
    settings: CraftIframeSettings,
  },
};

export default CraftIframe;
