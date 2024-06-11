import { Meta, StoryObj } from '@storybook/react';

import Label from '.';

const meta = {
  title: 'Components/Label',
  component: Label,
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 'This is a label that uses the value prop',
  },
};
