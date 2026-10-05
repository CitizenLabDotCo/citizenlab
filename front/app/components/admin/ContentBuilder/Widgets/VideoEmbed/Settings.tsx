import React from 'react';

import { Box, Error } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import TextArea from 'components/UI/TextArea';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    markup,
  } = useNode((node) => ({
    markup: node.data.props.markup,
  }));

  return (
    <Box background="#ffffff" marginBottom="20px">
      <Error text={formatMessage(messages.warningEmbedCode)} />
      <Box mt="28px">
        <TextArea
          label={formatMessage(messages.embedCode)}
          minRows={5}
          value={markup}
          onChange={(value) => {
            setProp((props) => (props.markup = value));
          }}
        />
      </Box>
    </Box>
  );
};

export default Settings;
