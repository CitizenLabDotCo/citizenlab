import { Meta, StoryObj } from '@storybook/react';

import ColorIndicator from '.';

const meta = {
  title: 'Components/Data display/ColorIndicator',
  tags: ['shared'],
  parameters: { gv: {} },
  component: ColorIndicator,
} satisfies Meta<typeof ColorIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    bgColor: 'red',
  },
};
