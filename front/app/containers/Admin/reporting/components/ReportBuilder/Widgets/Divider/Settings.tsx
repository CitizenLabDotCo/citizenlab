import React from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

import { Props, DividerVariant } from '.';

const Settings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    variant,
  } = useNode((node) => ({
    variant: (node.data.props as Props).variant ?? 'section',
  }));

  const options: IOption[] = [
    { value: 'section', label: formatMessage(messages.variantSection) },
    { value: 'hairline', label: formatMessage(messages.variantHairline) },
    { value: 'dots', label: formatMessage(messages.variantDots) },
  ];

  return (
    <Box mb="20px">
      <Select
        label={formatMessage(messages.variantLabel)}
        value={variant}
        options={options}
        onChange={({ value }: IOption) => {
          setProp((props: Props) => {
            props.variant = value as DividerVariant;
          });
        }}
      />
    </Box>
  );
};

export default Settings;
