import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  moderatorsHandler,
  previewLinkEnabledHandler,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignProjectHeader';

import ShareDropdown from '.';

// The Share button in the project header; it opens the share panel.

const meta = {
  title: 'Components/Redesigned/Project header/Share dropdown',
  tags: ['bo', 'redesigned'],
  component: ShareDropdown,
  parameters: {
    msw: [moderatorsHandler, previewLinkEnabledHandler, ...backofficeRedesignHandlers],
  },
  args: { project: project1, opened: false, onOpenChange: fn() },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 460,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ position: 'relative', display: 'flex' }}>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ShareDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed. */
export const Default: Story = {};

/** Opened: the share panel under the button. */
export const Open: Story = {
  args: { opened: true },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 620 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Lotte Janssens');
  },
};

export const RTL: Story = {
  args: { opened: true },
  globals: { lang: 'ar' },
  decorators: Open.decorators,
};
