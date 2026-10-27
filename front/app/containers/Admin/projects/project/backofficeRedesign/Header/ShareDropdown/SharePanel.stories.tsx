import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { t } from 'design-system/tokens/tokens';
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

import SharePanel from './SharePanel';

// The panel inside the Share dropdown: invite people to manage the project
// by email, the people who have access, and the private preview link.

const meta = {
  title: 'Components/Redesigned/Project header/Share panel',
  tags: ['bo', 'redesigned'],
  component: SharePanel,
  parameters: {
    msw: [moderatorsHandler, previewLinkEnabledHandler, ...backofficeRedesignHandlers],
  },
  args: { project: project1, linkCopied: false, onLinkCopied: fn() },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 420,
          padding: 16,
          background: 'white',
          borderRadius: t.radius[2],
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
        }}
      >
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Lotte Janssens');
  },
} satisfies Meta<typeof SharePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Five people with access and the preview link ready to copy. */
export const Default: Story = {};

/** Right after copying the preview link. */
export const LinkCopied: Story = {
  args: { linkCopied: true },
};

/** The preview link is not in the platform's plan: greyed out. */
export const PreviewLinkUnavailable: Story = {
  parameters: {
    msw: [moderatorsHandler, ...backofficeRedesignHandlers],
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
