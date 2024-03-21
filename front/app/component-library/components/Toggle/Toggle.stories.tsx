import { Meta, StoryObj } from '@storybook/react';

import { colors } from '../../utils/styleUtils';

import Toggle from './';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: false,
    onChange: () => {},
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    onChange: () => {},
  },
};

export const WithLabel: Story = {
  args: {
    checked: false,
    label: 'A toggle with label',
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
    onChange: () => {},
  },
};

export const WithLabelTextColor: Story = {
  args: {
    checked: false,
    disabled: false,
    label: 'A toggle with colored label',
    labelTextColor: colors.textSecondary,
    onChange: () => {},
  },
};
