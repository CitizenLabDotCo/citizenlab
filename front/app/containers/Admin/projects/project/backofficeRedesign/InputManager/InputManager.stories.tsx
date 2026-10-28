import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  waitForText,
  withDesktopWidth,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';

import InputManager from '.';

// The Manage view of an ideation phase: the list of inputs with its
// toolbar and filters, and the stats and exports beside it.

const meta = {
  title: 'Components/Redesigned/Input manager/Input manager',
  tags: ['bo', 'redesigned'],
  component: InputManager,
  parameters: { layout: 'fullscreen', msw: backofficeRedesignHandlers },
  args: { project: project1, phase: ideationPhase },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, minHeight: 800 }}>
        <Story />
      </div>
    ),
    withDesktopWidth,
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Plant oaks along the canal');
  },
} satisfies Meta<typeof InputManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
