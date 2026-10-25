import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  EventFormHarness,
  eventStoryHandlers,
} from '../../../../../../../.storybook/mocks/backofficeRedesignEvents';

import ImageCard from './ImageCard';

// The image card of the setup panel: a drop zone until an image is picked,
// then the image with its alt text. Picking one opens the crop modal.

interface StoryArgs {
  withImage?: boolean;
}

const meta = {
  title: 'Components/Redesigned/Events/Image card',
  tags: ['bo', 'redesigned'],
  component: ImageCard,
  parameters: { msw: eventStoryHandlers },
  args: { withImage: false },
  render: ({ withImage }) => (
    <EventFormHarness withImage={withImage}>
      {(form) => <ImageCard form={form} />}
    </EventFormHarness>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: 524, padding: 18, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Image');
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No image yet: the drop zone. */
export const Default: Story = {};

/** An image picked, with its alt text field. */
export const WithImage: Story = {
  args: { withImage: true },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'tree-route-park.jpg');
  },
};

/** The crop modal, opened from the image's crop button. */
export const CropOpen: Story = {
  args: { withImage: true },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'tree-route-park.jpg');
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByLabelText('Crop image'));
    await waitForText(document.body, 'Done');
  },
};

export const RTL: Story = {
  args: { withImage: true },
  globals: { lang: 'ar' },
  play: async () => {},
};
