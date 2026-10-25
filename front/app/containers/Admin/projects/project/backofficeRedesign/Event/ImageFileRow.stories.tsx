import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { UploadFile } from 'typings';

import { sampleImage } from '../../../../../../../.storybook/mocks/backofficeRedesignEvents';

import ImageFileRow from './ImageFileRow';

// The picked event image in the image card: a thumbnail, the file name,
// its size and dimensions, and buttons to crop, replace or delete it.

const withName = (name: string, remote = false): UploadFile => {
  const image = sampleImage();
  const file = new File([image], name, { type: image.type });
  return Object.assign(file, {
    base64: image.base64,
    url: image.url,
    remote,
    filename: name,
  });
};

const meta = {
  title: 'Components/Redesigned/Events/Image file row',
  tags: ['bo', 'redesigned'],
  component: ImageFileRow,
  args: {
    image: sampleImage(),
    thumbnail: sampleImage().base64,
    onCrop: fn(),
    onReplace: fn(),
    onRemove: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 500, padding: 18, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageFileRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A newly picked image, which can still be cropped. */
export const Default: Story = {};

/** An image already saved with the event: no crop button. */
export const Saved: Story = {
  args: {
    image: withName('tree-route-park.jpg', true),
    onCrop: undefined,
  },
};

export const LongContent: Story = {
  args: {
    image: withName(
      'photo-of-the-park-gate-on-koekenbakstraat-taken-in-october.jpg'
    ),
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
