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
    titleMultiloc,
  } = useNode((node) => ({
    titleMultiloc: node.data.props.titleMultiloc,
  }));

  return (
    <Box my="20px">
      <InputMultilocWithLocaleSwitcher
        id="open_to_participation_title"
        type="text"
        label={formatMessage(messages.title)}
        name="open_to_participation_title"
        valueMultiloc={titleMultiloc}
        onChange={(valueMultiloc) =>
          setProp((props) => (props.titleMultiloc = valueMultiloc))
        }
      />
    </Box>
  );
};

export default Settings;
