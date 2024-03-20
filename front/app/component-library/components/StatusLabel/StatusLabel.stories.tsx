import React from 'react';

import { colors } from '../../utils/styleUtils';

import StatusLabel from './';

export default {
  title: 'Components/StatusLabel',
  component: StatusLabel,
};

export const Default = {
  render: () => <StatusLabel text="In consideration" backgroundColor="navy" />,
  name: 'default',
};

export const WithIconProp = {
  render: () => (
    <StatusLabel text="In consideration" icon="lock" backgroundColor="navy" />
  ),
  name: 'with icon prop',
};

export const VariantOutlined = {
  render: () => (
    <StatusLabel
      text="Beta"
      backgroundColor={colors.adminBackground}
      variant={'outlined'}
    />
  ),
  name: 'variant - outlined',
};

export const VariantOutlinedWithIcon = {
  render: () => (
    <StatusLabel
      text="Beta"
      backgroundColor={colors.adminBackground}
      icon="lock"
      variant={'outlined'}
    />
  ),

  name: 'variant - outlined with icon',
};
