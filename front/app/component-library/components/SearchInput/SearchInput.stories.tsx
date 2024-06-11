import { Meta, StoryObj } from '@storybook/react';

import SearchInput from './';

const meta = {
  title: 'Components/SearchInput',
  component: SearchInput,
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'search-input',
    a11y_closeIconTitle: 'Close search',
    debounce: 500,
    placeholder: 'placeholder',
    ariaLabel: 'aria label',
    onChange: () => {},
    size: 'medium',
  },
};

export const WithDefaultValue: Story = {
  args: {
    ...Default.args,
    defaultValue: 'Default search value',
  },
};
