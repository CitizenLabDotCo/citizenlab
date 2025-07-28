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
    title: 'Multi-select',
    selected: ['option-1'],
    options: [
      { value: 'option-1', label: 'Option 1' },
      { value: 'option-2', label: 'Option 2' },
      { value: 'option-3', label: 'Option 3', disabled: true },
      { value: 'option-4', label: 'Option 4' },
    ],
  },
};
