import { Meta, StoryObj } from '@storybook/react';

import Select from './';

const meta = {
  title: 'Components/Select',
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: [
      {
        value: 'option-1',
        label: 'Option 1',
      },
      {
        value: 'option-1',
        label: 'Option 2',
      },
    ],
    onChange: () => {},
  },
};

export const WithSelectedOption: Story = {
  args: {
    ...Default.args,
    value: {
      value: 'option-1',
      label: 'Option 1',
    },
  },
};

export const WithLabel: Story = {
  args: {
    ...WithSelectedOption.args,
    label: 'This is a label',
  },
};

export const Disabled: Story = {
  args: {
    ...WithSelectedOption.args,
    disabled: true,
  },
};

export const WithNumberValues: Story = {
  args: {
    options: [
      {
        value: 1,
        label: 'Option 1',
      },
      {
        value: 2,
        label: 'Option 2',
      },
    ],
    value: {
      value: 3,
      label: 'Option 1',
    },
    onChange: () => {},
  },
};

export const WithPlaceholder: Story = {
  args: {
    ...Default.args,
    placeholder: 'Placeholder',
  },
};
