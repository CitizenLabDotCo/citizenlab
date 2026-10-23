import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { waitFor } from 'storybook/test';

import { getOrigin } from 'utils/storybook/getOrigin';

import Image from '.';

const src = `${getOrigin()}/images/image16.png`;
const missing = `${getOrigin()}/images/does-not-exist.png`;

// The app's image: it fades in once loaded and can fall back to a second
// source. "(UI)" keeps it apart from the library Image. The play step waits
// until the image has loaded (or failed), so the capture is final.
const meta = {
  title: 'Components/Data display/Image (UI)',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Image,
  args: { src, alt: 'A park in the city', isLazy: false },
  render: (args) => (
    <div style={{ width: '480px', height: '270px', padding: '8px' }}>
      <Image {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const img = canvasElement.querySelector('img');
      if (!img?.complete) throw new Error('image not settled yet');
    });
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: '480px', padding: '8px' }}>
      <Image {...args} className="story-image" />
      <style>{'.story-image { width: 100%; }'}</style>
    </div>
  ),
};

// `cover` crops the image to fill a fixed box.
export const Cover: Story = {
  args: { cover: true },
  render: (args) => (
    <div style={{ width: '480px', padding: '8px' }}>
      <Image {...args} className="story-image" />
      <style>{'.story-image { width: 100%; height: 160px; }'}</style>
    </div>
  ),
};

// The source fails, so the fallback source shows instead.
export const Fallback: Story = {
  args: {
    src: missing,
    fallbackSrc: `${getOrigin()}/images/city.png`,
  },
  render: Default.render,
};

// The source fails and there is no fallback: the image stays hidden on its
// placeholder background.
export const Empty: Story = {
  args: { src: missing },
  render: (args) => (
    <div style={{ width: '480px', padding: '8px' }}>
      <Image {...args} className="story-image" />
      <style>{'.story-image { width: 100%; height: 160px; }'}</style>
    </div>
  ),
};
