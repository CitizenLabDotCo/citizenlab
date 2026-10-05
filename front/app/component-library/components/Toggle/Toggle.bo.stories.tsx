import React, { ComponentProps, useState } from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Box from '../Box';

import Toggle from './';

type ToggleProps = ComponentProps<typeof Toggle>;

// Everything new for the back office redesign lives under "Back office 2026"
// and carries the `bo-2026` tag, so it can be found and filtered in one place.
const meta = {
  title: 'Back office 2026/Toggle',
  component: Toggle,
  tags: ['bo-2026'],
  args: {
    variant: 'bo',
    checked: false,
    onChange: () => {},
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'bo'] },
  },
  render: (args) => <InteractiveToggle {...args} />,
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveToggle = (args: ToggleProps) => {
  const [checked, setChecked] = useState(args.checked);
  return (
    <Toggle
      {...args}
      checked={checked}
      onChange={() => setChecked((value) => !value)}
    />
  );
};

export const Off: Story = {};

export const On: Story = {
  args: { checked: true },
};

export const WithLabel: Story = {
  args: { checked: true, label: 'Submitting ideas' },
};

export const Disabled: Story = {
  args: { checked: false, disabled: true, label: 'Reacting to ideas' },
};

export const DisabledOn: Story = {
  args: { checked: true, disabled: true, label: 'Reacting to ideas' },
};

// The participant actions list from the phase panel, as it reads in context.
export const ParticipantActions: Story = {
  render: () => (
    <Box display="flex" flexDirection="column" gap="12px">
      <InteractiveToggle
        variant="bo"
        checked
        label="Submitting ideas"
        onChange={() => {}}
      />
      <InteractiveToggle
        variant="bo"
        checked
        label="Commenting on ideas"
        onChange={() => {}}
      />
      <InteractiveToggle
        variant="bo"
        checked={false}
        disabled
        label="Reacting to ideas"
        onChange={() => {}}
      />
      <InteractiveToggle
        variant="bo"
        checked
        label="Attending an event"
        onChange={() => {}}
      />
    </Box>
  ),
};

// Side by side with the current toggle, so reviewers can compare.
export const ComparedWithDefault: Story = {
  render: () => (
    <Box display="flex" gap="48px">
      <Box display="flex" flexDirection="column" gap="12px">
        <InteractiveToggle
          variant="default"
          checked
          label="Default (today)"
          onChange={() => {}}
        />
        <InteractiveToggle
          variant="default"
          checked={false}
          label="Default (today)"
          onChange={() => {}}
        />
      </Box>
      <Box display="flex" flexDirection="column" gap="12px">
        <InteractiveToggle
          variant="bo"
          checked
          label="Back office 2026"
          onChange={() => {}}
        />
        <InteractiveToggle
          variant="bo"
          checked={false}
          label="Back office 2026"
          onChange={() => {}}
        />
      </Box>
    </Box>
  ),
};
