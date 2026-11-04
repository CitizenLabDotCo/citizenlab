import { Meta, StoryObj } from '@storybook/react';

import imageFile from './image.png';

import Image from '.';

const meta = {
  title: 'Components/Data display/Image',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Image,
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

const image = {
  src: imageFile,
  alt: 'Go Vocal logo',
};

export const Default: Story = {
  args: {
    src: image.src,
    alt: image.alt,
  },
};
