import { Meta, StoryObj } from '@storybook/react';

import StatusLabel from './';

const meta = {
  title: 'Components/StatusLabel',
  component: StatusLabel,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof StatusLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'In consideration',
    backgroundColor: 'blue700',
  },
};

export const WithIconProp: Story = {
  args: {
    ...Default.args,
    icon: 'lock',
  },
};

export const VariantOutlined: Story = {
  args: {
    ...Default.args,
    variant: 'outlined',
  },
};

export const VariantOutlinedWithIcon: Story = {
  args: {
    ...Default.args,
    icon: 'lock',
    variant: 'outlined',
  },
};
