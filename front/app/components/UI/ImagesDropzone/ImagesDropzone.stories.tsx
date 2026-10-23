import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, waitFor } from 'storybook/test';
import { UploadFile } from 'typings';

import { getOrigin } from 'utils/storybook/getOrigin';

import ImagesDropzone from '.';

// Turns a static image into the base64 upload the dropzone previews.
const loadUpload = async (): Promise<UploadFile> => {
  const blob = await (await fetch(`${getOrigin()}/images/image16.png`)).blob();
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
  return Object.assign(new File([blob], 'image16.png', { type: blob.type }), {
    filename: 'image16.png',
    base64,
    url: '',
    remote: false,
  });
};

// Its labels are translated through injectIntl, which renders once the app
// configuration (MSW) has loaded, so the play step waits for the dropzone.
const meta = {
  title: 'Components/Forms/ImagesDropzone',
  tags: ['shared'],
  parameters: { gv: {} },
  component: ImagesDropzone,
  args: {
    images: null,
    imagePreviewRatio: 135 / 298,
    maxImagePreviewWidth: '360px',
    onAdd: fn(),
    onRemove: fn(),
  },
  render: (args) => (
    <Box width="360px" maxWidth="100%">
      <ImagesDropzone {...args} />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      if (!canvasElement.querySelector('[data-testid="images-dropzone"]')) {
        throw new globalThis.Error('dropzone not rendered yet');
      }
    });
  },
} satisfies Meta<typeof ImagesDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// The hover style sits on the dropzone box around the file input.
export const Hover: Story = {
  parameters: {
    pseudo: { hover: ['[data-testid="images-dropzone"] [tabindex]'] },
  },
};

// The focus style is focus-within on the same box, so the play step tabs in.
export const Focus: Story = {
  play: async (context) => {
    await meta.play(context);
    await userEvent.tab();
  },
};

export const WithImage: Story = {
  loaders: [async () => ({ upload: await loadUpload() })],
  render: (args, { loaded }) => (
    <Box width="360px" maxWidth="100%">
      <ImagesDropzone {...args} images={[loaded.upload as UploadFile]} />
    </Box>
  ),
  play: async (context) => {
    await meta.play(context);
    await waitFor(() => {
      const preview = context.canvasElement.querySelector(
        '[style*="blob:"], [src^="blob:"]'
      );
      if (!preview && !context.canvasElement.innerHTML.includes('blob:')) {
        throw new globalThis.Error('preview not rendered yet');
      }
    });
  },
};

export const Error: Story = {
  args: { errorMessage: 'The image is larger than 10 MB.' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
