import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

import { Props } from '.';

const Settings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    title,
  } = useNode((node) => ({ title: (node.data.props as Props).title }));

  return (
    <Box mb="20px">
      <InputMultilocWithLocaleSwitcher
        label={
          <Text variant="bodyM" color="textSecondary" mb="0">
            {formatMessage(messages.headingLabel)}
          </Text>
        }
        type="text"
        valueMultiloc={title}
        onChange={(value: Multiloc) => {
          setProp((props: Props) => {
            props.title = value;
          });
        }}
      />
    </Box>
  );
};

export default Settings;
