import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent } from 'storybook/test';

import SearchInput from '.';

// The app's search field: the library SearchInput with translated
// placeholder, label and screen reader announcements. "(UI)" keeps it apart
// from the library SearchInput.
const meta = {
  title: 'Components/Forms/SearchInput (UI)',
  tags: ['shared'],
  parameters: { gv: {} },
  component: SearchInput,
  args: { onChange: fn(), a11y_numberOfSearchResults: 12 },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hover: Story = {
  parameters: { pseudo: { hover: ['input'] } },
};

// Focus also floats the label, which the library does in state, so the
// input gets a real keyboard focus.
export const Focus: Story = {
  play: async () => {
    await userEvent.tab();
  },
};

export const WithValue: Story = {
  args: { defaultValue: 'bike lanes' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
