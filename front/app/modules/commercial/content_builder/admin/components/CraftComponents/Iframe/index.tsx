import React from 'react';

// utils
import { isNil } from 'lodash-es';

// components
import { Box, IconTooltip, Input } from '@citizenlab/cl2-component-library';

// intl
import messages from '../../../messages';
import { injectIntl } from 'utils/cl-intl';

// craft
import { useNode } from '@craftjs/core';

const CraftIframe = ({ embedCode, height }) => {
  const iframeElement = document.createElement('div');
  iframeElement.innerHTML = embedCode.trim();
  iframeElement.firstElementChild?.setAttribute('height', height);
  iframeElement.firstElementChild?.setAttribute('width', '100%');

  if (!isNil(iframeElement)) {
    return (
      <Box minHeight="26px">
        <div dangerouslySetInnerHTML={{ __html: iframeElement.outerHTML }} />
      </Box>
    );
  } else {
    return (
      <Box minHeight="26px">
        <div dangerouslySetInnerHTML={{ __html: embedCode }} />
      </Box>
    );
  }
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
    <Box flexWrap="wrap" display="flex" gap="16px" marginBottom="20px">
      <Box flex="0 0 100%">
        <Input
          label={
            <span>
              {formatMessage(messages.embedCodeLabel)}{' '}
              <IconTooltip
                icon="info3"
                content={formatMessage(messages.embedCodeLabelTooltip)}
              />
            </span>
          }
          placeholder={formatMessage(messages.embedCodePlaceholder)}
          type="text"
          value={embedCode}
          onChange={(value) => {
            setProp((props) => (props.embedCode = value));
          }}
        />
      </Box>
      <Box flex="0 0 100%">
        <Input
          label={
            <span>
              {formatMessage(messages.embedHeightLabel)}{' '}
              <IconTooltip
                icon="info3"
                content={formatMessage(messages.embedHeightLabelTooltip)}
              />
            </span>
          }
          placeholder={formatMessage(messages.embedHeightPlaceholder)}
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
    embedCode: '',
    height: '',
  },
  related: {
    settings: CraftIframeSettings,
  },
};

export default CraftIframe;
