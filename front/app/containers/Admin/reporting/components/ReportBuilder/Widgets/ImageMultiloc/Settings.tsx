import React from 'react';

import { Box, Toggle } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { ImageSettings } from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    _stretch,
  } = useNode((node) => ({
    _stretch: node.data.props.stretch,
  }));

  // This prop should be 'true' by default,
  // but because it was added later it is undefined
  // for older reports. Here we make sure it behaves as
  // 'true' when it's undefined
  const stretch = _stretch ?? true;

  return (
    <Box mb="20px">
      <ImageSettings />
      <Toggle
        checked={stretch ?? true}
        label={formatMessage(messages.stretch)}
        onChange={() => {
          setProp((props) => {
            props.stretch = !stretch;
          });
        }}
      />
    </Box>
  );
};

export default Settings;
