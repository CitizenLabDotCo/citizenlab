import React from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';

import { Props, DividerVariant, DIVIDER_VARIANTS } from '.';

const VARIANT_LABELS: Record<DividerVariant, MessageDescriptor> = {
  section: messages.variantSection,
  hairline: messages.variantHairline,
  dots: messages.variantDots,
};

// Select hands the value back as `any`, so it is checked before it is stored.
const isDividerVariant = (value: unknown): value is DividerVariant =>
  DIVIDER_VARIANTS.some((variant) => variant === value);

const Settings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    variant,
  } = useNode((node) => ({
    variant: (node.data.props as Props).variant ?? 'section',
  }));

  const options: IOption[] = DIVIDER_VARIANTS.map((option) => ({
    value: option,
    label: formatMessage(VARIANT_LABELS[option]),
  }));

  return (
    <Box mb="20px">
      <Select
        label={formatMessage(messages.variantLabel)}
        value={variant}
        options={options}
        onChange={({ value }: IOption) => {
          if (!isDividerVariant(value)) return;

          setProp((props: Props) => {
            props.variant = value;
          });
        }}
      />
    </Box>
  );
};

export default Settings;
