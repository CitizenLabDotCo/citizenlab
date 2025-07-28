import MultiSelect from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Fruit basket',
    selected: ['apple'],
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'coconut', label: 'Coconut', disabled: true },
      { value: 'durian', label: 'Durian' },
    ],
    onChange: (values) => console.log('Selected values:', values),
  },
};
