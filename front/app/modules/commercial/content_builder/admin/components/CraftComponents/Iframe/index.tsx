import React from 'react';

// components
import { Box, IconTooltip, Input } from '@citizenlab/cl2-component-library';

// intl
import messages from '../../../messages';
import { injectIntl } from 'utils/cl-intl';

// craft
import { useNode } from '@craftjs/core';

const CraftIframe = ({ url, height }) => {
  // URL Validation Goes Here

  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', url);
  iframe.setAttribute('height', height);
  iframe.setAttribute('width', '100%');

  return (
    <Box minHeight="26px">
      <div dangerouslySetInnerHTML={{ __html: iframe.outerHTML }} />
    </Box>
  );
};

const CraftIframeSettings = injectIntl(({ intl: { formatMessage } }) => {
  const {
    actions: { setProp },
    url,
    height,
  } = useNode((node) => ({
    url: node.data.props.url,
    height: node.data.props.height,
  }));

  return (
    <Box flexWrap="wrap" display="flex" gap="16px" marginBottom="20px">
      <Box flex="0 0 100%">
        <Input
          label={
            <span>
              {formatMessage(messages.iframeUrlLabel)}{' '}
              <IconTooltip
                icon="info3"
                content={formatMessage(messages.iframeUrlLabelTooltip)}
              />
            </span>
          }
          placeholder={formatMessage(messages.iframeUrlPlaceholder)}
          type="text"
          value={url}
          onChange={(value) => {
            setProp((props) => (props.url = value));
          }}
        />
      </Box>
      <Box flex="0 0 100%">
        <Input
          label={
            <span>
              {formatMessage(messages.iframeHeightLabel)}{' '}
              <IconTooltip
                icon="info3"
                content={formatMessage(messages.iframeHeightLabelTooltip)}
              />
            </span>
          }
          placeholder={formatMessage(messages.iframeHeightPlaceholder)}
          type="text"
          value={height}
          onChange={(value) => {
            setProp((props) => (props.height = value));
          }}
        />
      </Box>
    </Box>
  );
});

CraftIframe.craft = {
  props: {
    url: '',
    height: '',
  },
  related: {
    settings: CraftIframeSettings,
  },
};

export default CraftIframe;
