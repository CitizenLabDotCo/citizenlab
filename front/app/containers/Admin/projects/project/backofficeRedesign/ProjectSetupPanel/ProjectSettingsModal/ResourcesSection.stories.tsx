import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import { waitForText } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  filesHandler,
  noFilesHandler,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignSetupPanel';

import ResourcesSection from './ResourcesSection';

// The resources section of the project settings: a link to the project's
// files and how many there are.

const meta = {
  title: 'Components/Redesigned/Setup panel/Resources section',
  tags: ['bo', 'redesigned'],
  component: ResourcesSection,
  parameters: { msw: [filesHandler] },
  args: { projectId: project1.id },
  decorators: [
    (Story) => (
      <div style={{ width: 560, maxWidth: '100%', padding: 24, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '2');
  },
} satisfies Meta<typeof ResourcesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two files attached. */
export const Default: Story = {};

/** No files yet. */
export const Empty: Story = {
  parameters: { msw: [noFilesHandler] },
  play: async () => {},
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
