import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { waitForText } from '../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  eventStoryHandlers,
  mockAttachments,
} from '../../../../../../../.storybook/mocks/backofficeRedesignEvents';

import PreviewAttachment from './PreviewAttachment';

// A file attached to the event, as it shows in the event preview: a
// paperclip and the file's name.

const meta = {
  title: 'Components/Redesigned/Events/Preview attachment',
  tags: ['bo', 'redesigned'],
  component: PreviewAttachment,
  parameters: { msw: eventStoryHandlers },
  args: { attachment: mockAttachments[0] },
  decorators: [
    (Story) => (
      <div style={{ width: 311, padding: 16, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PreviewAttachment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Tree route map.pdf');
  },
};

export const LongContent: Story = {
  args: { attachment: mockAttachments[1] },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Planting plan');
  },
};
