import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { waitForText } from '../../../../../../../.storybook/mocks/backofficeRedesign';
import { sampleImage } from '../../../../../../../.storybook/mocks/backofficeRedesignEvents';

import ImageCropModal from './ImageCropModal';

// The modal that opens once an event image is picked, to crop it to the
// 3:1 banner the event page shows.

const meta = {
  title: 'Components/Redesigned/Events/Image crop modal',
  tags: ['bo', 'redesigned'],
  component: ImageCropModal,
  parameters: { layout: 'fullscreen' },
  args: {
    opened: true,
    image: sampleImage(),
    onCrop: fn(),
    onRemove: fn(),
    onClose: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 800 }}>
        <Story />
      </div>
    ),
  ],
  play: async () => {
    await waitForText(document.body, 'Crop image');
  },
} satisfies Meta<typeof ImageCropModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open, with a picked image to crop. */
export const Default: Story = {};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
