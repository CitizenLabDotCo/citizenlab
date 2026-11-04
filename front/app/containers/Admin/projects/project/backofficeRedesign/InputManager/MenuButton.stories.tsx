import React from 'react';

import { Button, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import MenuButton from './MenuButton';
import OptionList from './OptionList';

// The button-plus-dropdown the input manager uses for all its menus
// (batch actions, filters, columns, side panel properties): any trigger,
// and a dropdown below it that closes on a click outside.

const meta = {
  title: 'Components/Redesigned/Input manager/Menu button',
  tags: ['bo', 'redesigned'],
  component: MenuButton,
  args: {
    trigger: ({ opened, toggle }) => (
      <Button
        buttonStyle="bo-secondary"
        icon="check-circle"
        onClick={toggle}
        ariaExpanded={opened}
        ariaHasPopup="menu"
      >
        Status
      </Button>
    ),
    children: () => (
      <OptionList
        options={[
          { value: 'proposed', label: 'Proposed', color: '#687782' },
          { value: 'accepted', label: 'Accepted', color: '#04884C' },
          { value: 'rejected', label: 'Rejected', color: '#E52516' },
        ]}
        selected={['proposed']}
        onToggle={() => {}}
      />
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 220, width: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MenuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: only the trigger shows. */
export const Default: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /Status/ })
    );
  },
};

/** Aligned to the right edge of the trigger, as the filter menu is. */
export const OpenRightAligned: Story = {
  args: {
    align: 'right',
    children: () => (
      <Text m="8px" variant="boHelper">
        A dropdown aligned to the right of its trigger.
      </Text>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Story />
      </div>
    ),
  ],
  play: Open.play,
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: Open.play,
};
