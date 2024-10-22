import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    buttonTextMultiloc,
  } = useNode((node) => ({
    buttonTextMultiloc: node.data.props.buttonTextMultiloc,
  }));

  return (
    <Box mt="48px" mb="20px">
      <InputMultilocWithLocaleSwitcher
        id="spotlight-button-text-multiloc"
        type="text"
        label={formatMessage(messages.buttonText)}
        name="highlight_title"
        valueMultiloc={buttonTextMultiloc}
        onChange={(valueMultiloc) =>
          setProp((props) => (props.buttonTextMultiloc = valueMultiloc))
        }
      />
    </Box>
  );
};

export default Settings;
