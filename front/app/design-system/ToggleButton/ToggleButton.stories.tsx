import React from 'react';

import ToggleButtonGroup from '../ToggleButtonGroup';

import ToggleButton from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Actions/ToggleButton',
  component: ToggleButton,
  args: { children: 'Option' },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {[false, true].map((isSelected) => (
        <div
          key={String(isSelected)}
          style={{ display: 'flex', gap: 16, alignItems: 'center' }}
        >
          <ToggleButton isSelected={isSelected}>Option</ToggleButton>
          <ToggleButton isSelected={isSelected} isDisabled>
            Option
          </ToggleButton>
          <ToggleButton isSelected={isSelected} icon="plus-14">
            Option
          </ToggleButton>
        </div>
      ))}
    </div>
  ),
};

// Looks disabled, stays focusable; hover or focus shows why. Pressing it, or Space or
// Enter on it, leaves the selection as it is.
export const DisabledWithReason: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <ToggleButton disabledReason="Add a second language first">
        Option
      </ToggleButton>
      <ToggleButtonGroup aria-label="Language" defaultSelectedKeys={['en']}>
        <ToggleButton id="en">English</ToggleButton>
        <ToggleButton id="fr" disabledReason="Add French in the settings first">
          French
        </ToggleButton>
        <ToggleButton id="nl">Dutch</ToggleButton>
      </ToggleButtonGroup>
    </div>
  ),
};
