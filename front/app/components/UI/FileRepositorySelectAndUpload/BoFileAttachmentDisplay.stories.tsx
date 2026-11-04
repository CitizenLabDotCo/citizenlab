import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { fn } from 'storybook/test';

import { waitForText } from '../../../../.storybook/mocks/backofficeRedesign';
import {
  mockAttachments,
  sharedPiecesHandlers,
} from '../../../../.storybook/mocks/backofficeRedesignSharedPieces';

import BoFileAttachmentDisplay from './BoFileAttachmentDisplay';

// A back-office file row: a drag handle, a paperclip, the file name in 12px
// (ellipsis when long) and a small remove action. Event and phase
// attachments are lists of these.

const meta = {
  title: 'Components/Redesigned/Shared pieces/File attachment row',
  tags: ['bo', 'redesigned'],
  component: BoFileAttachmentDisplay,
  parameters: { msw: sharedPiecesHandlers },
  args: {
    fileAttachment: mockAttachments[0],
    index: 0,
    moveRow: fn(),
    dropRow: fn(),
    onDeleteClick: fn(),
    disabled: false,
  },
  decorators: [
    (Story) => (
      <DndProvider backend={HTML5Backend}>
        <Box w="300px" p="16px" background="white">
          <Story />
        </Box>
      </DndProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Tree route map');
  },
} satisfies Meta<typeof BoFileAttachmentDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A long file name ends in an ellipsis. */
export const LongContent: Story = {
  args: { fileAttachment: mockAttachments[1], index: 1 },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Planting plan');
  },
};

/** Two rows, as a card lists them. */
export const List: Story = {
  render: (args) => (
    <Box display="flex" flexDirection="column" gap="4px">
      {mockAttachments.map((attachment, index) => (
        <BoFileAttachmentDisplay
          key={attachment.id}
          {...args}
          fileAttachment={attachment}
          index={index}
        />
      ))}
    </Box>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
