import MultiSelect from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Forms/MultiSelect',
  tags: ['shared'],
  parameters: { gv: {} },
  component: MultiSelect,
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Fruit basket',
    selected: ['longan'],
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'coconut', label: 'Coconut' },
      { value: 'durian', label: 'Durian' },
      { value: 'elderberry', label: 'Elderberry' },
      { value: 'fig', label: 'Fig' },
      { value: 'grape', label: 'Grape' },
      { value: 'honeydew', label: 'Honeydew' },
      { value: 'indian_fig', label: 'Indian fig' },
      { value: 'jackfruit', label: 'Jackfruit' },
      { value: 'kiwi', label: 'Kiwi' },
      { value: 'longan', label: 'Looooooooooooooooooooooooooooongan' },
    ],
    onChange: () => {},
    onClear: () => {},
    a11y_clearbuttonActionMessage: 'Clear selection',
    a11y_clearSearchButtonActionMessage: 'Clear search',
  },
};

// The spinner sits in the dropdown, so the dropdown is open.
export const Loading: Story = {
  args: {
    title: 'Loading options',
    selected: [],
    options: [],
    isLoading: true,
    openedDefaultValue: true,
    onChange: () => {},
    a11y_clearbuttonActionMessage: 'Clear selection',
    a11y_clearSearchButtonActionMessage: 'Clear search',
  },
};

export const Search: Story = {
  args: {
    title: 'Searchable options',
    selected: [],
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'coconut', label: 'Coconut' },
      { value: 'durian', label: 'Durian' },
    ],
    searchValue: 'Lorem',
    searchPlaceholder: 'Search fruits...',
    onChange: () => {},
    onSearch: () => {},
    a11y_clearbuttonActionMessage: 'Clear selection',
    a11y_clearSearchButtonActionMessage: 'Clear search',
  },
};

// The trigger (an InputContainer button) carries the hover and focus styles.
export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: ['button'] } },
};

export const Focus: Story = {
  args: Default.args,
  parameters: { pseudo: { focus: ['button'], focusVisible: ['button'] } },
};

export const Open: Story = {
  args: { ...Default.args, openedDefaultValue: true },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    title: 'Districts where the project takes place',
    selected: ['apple', 'banana', 'coconut'],
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    ...Default.args,
    title: 'الفاكهة',
    selected: [],
    options: [
      { value: 'apple', label: 'تفاح' },
      { value: 'banana', label: 'موز' },
    ],
    openedDefaultValue: true,
  },
};
