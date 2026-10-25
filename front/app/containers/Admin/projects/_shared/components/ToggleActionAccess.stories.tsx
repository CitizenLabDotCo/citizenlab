import React from 'react';

import { Box, Toggle } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  waitForText,
} from '../../../../../../.storybook/mocks/backofficeRedesign';
import { postingPermissionHandler } from '../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import ToggleActionAccess from './ToggleActionAccess';

// The access link under a participation toggle ("Submitting inputs"):
// indented to line up with the toggle's label, it says who can do it and
// opens the access form.

const meta = {
  title: 'Components/Redesigned/Settings panel/Toggle action access',
  tags: ['bo', 'redesigned'],
  component: ToggleActionAccess,
  parameters: {
    msw: [postingPermissionHandler, ...backofficeRedesignHandlers],
  },
  args: { phaseId: ideationPhase.id, action: 'posting_idea' },
  render: (args) => (
    <>
      <Box mb="12px">
        <Toggle checked label="Submitting inputs" onChange={() => undefined} />
      </Box>
      <ToggleActionAccess {...args} />
    </>
  ),
  decorators: [
    (Story) => (
      <Box w="420px" p="16px" background="white">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Sign-in required');
  },
} satisfies Meta<typeof ToggleActionAccess>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Under the posting toggle. */
export const Default: Story = {};

/** Alone, without the toggle above. */
export const Alone: Story = {
  render: (args) => <ToggleActionAccess {...args} />,
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => undefined,
};
