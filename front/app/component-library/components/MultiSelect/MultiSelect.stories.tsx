import MultiSelect from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
