import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import MultiSelect from '.';

// The app's MultiSelect: the library one with translated clear-button
// labels. "(UI)" keeps it apart from the library MultiSelect.
const meta = {
  title: 'Components/Forms/MultiSelect (UI)',
  tags: ['shared'],
  parameters: { gv: {} },
  component: MultiSelect,
  args: {
    title: 'Topics',
    selected: ['climate'],
    options: [
      { value: 'mobility', label: 'Mobility' },
      { value: 'climate', label: 'Climate' },
      { value: 'housing', label: 'Housing' },
    ],
    onChange: fn(),
    onClear: fn(),
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// The trigger button carries the hover and focus styles.
export const Hover: Story = {
  parameters: { pseudo: { hover: ['button'] } },
};

export const Focus: Story = {
  parameters: {
    pseudo: {
      focus: ['button'],
      focusVisible: ['button'],
    },
  },
};

export const Open: Story = {
  args: { openedDefaultValue: true },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    title: 'المواضيع',
    options: [
      { value: 'mobility', label: 'التنقل' },
      { value: 'climate', label: 'المناخ' },
      { value: 'housing', label: 'السكن' },
    ],
  },
};
