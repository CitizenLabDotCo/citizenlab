import React from 'react';

import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl, MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

import { Props } from '.';

type TextProp = 'title' | 'subtitle' | 'eyebrow' | 'footnote';

const FIELDS: { name: TextProp; label: MessageDescriptor }[] = [
  { name: 'eyebrow', label: messages.eyebrowLabel },
  { name: 'title', label: messages.titleLabel },
  { name: 'subtitle', label: messages.subtitleLabel },
  { name: 'footnote', label: messages.footnoteLabel },
];

const Settings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as Props }));

  const setText = (name: TextProp) => (value: Multiloc) => {
    setProp((current: Props) => {
      current[name] = value;
    });
  };

  return (
    <Box mb="20px">
      {FIELDS.map(({ name, label }) => (
        <Box key={name} mb="20px">
          <InputMultilocWithLocaleSwitcher
            label={
              <Text variant="bodyM" color="textSecondary" mb="0">
                {formatMessage(label)}
              </Text>
            }
            type="text"
            valueMultiloc={props[name]}
            onChange={setText(name)}
          />
        </Box>
      ))}

      <Toggle
        checked={props.showLogo !== false}
        label={formatMessage(messages.showLogoLabel)}
        onChange={() => {
          setProp((current: Props) => {
            current.showLogo = current.showLogo === false;
          });
        }}
      />
    </Box>
  );
};

export default Settings;
