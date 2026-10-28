import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { sharedPiecesHandlers } from '../../../../.storybook/mocks/backofficeRedesignSharedPieces';

import QuillMultilocWithLocaleSwitcher from './QuillMultilocWithLocaleSwitcher';

import QuillEditor from '.';

// The back-office rich-text frame: the Quill toolbar and editor in one
// box with a thin grey border and an 8px radius, grey toolbar icons, and
// the bo locale tabs above it. Event and phase descriptions use it.

const meta = {
  title: 'Components/Redesigned/Library variants/Back-office rich text',
  tags: ['bo', 'redesigned'],
  component: QuillEditor,
  parameters: { msw: sharedPiecesHandlers },
  args: {
    id: 'bo-quill-story',
    variant: 'bo',
    minHeight: '74px',
    placeholder: 'Add a description',
    ariaLabel: 'Description',
    value: '',
    onChange: fn(),
  },
  decorators: [
    (Story, { name }) => (
      <Box w="500px" p="24px" background="white">
        <Text variant="boMicro" m="0px" mb="8px">
          {name}
        </Text>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof QuillEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty editor with its placeholder. */
export const Default: Story = {};

/** With formatted text. */
export const Filled: Story = {
  args: {
    value:
      '<p>Join us to decide <strong>where the new trees go</strong>.</p><ul><li>Bring a map of your street</li><li>Coffee is on us</li></ul>',
  },
};

/** With the bo locale tabs above, as the event and phase panels show it. */
export const WithLocaleTabs: Story = {
  render: (args) => (
    <QuillMultilocWithLocaleSwitcher
      id="bo-quill-multiloc-story"
      variant="bo"
      minHeight="74px"
      placeholder={args.placeholder}
      ariaLabel="Description"
      valueMultiloc={{ en: '<p>Join us to decide where the new trees go.</p>' }}
      onChange={fn()}
      withCTAButton
    />
  ),
};

/** A label above the frame. */
export const WithLabel: Story = {
  args: { label: 'Description' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { value: '<p>Join us to decide where the new trees go.</p>' },
};
