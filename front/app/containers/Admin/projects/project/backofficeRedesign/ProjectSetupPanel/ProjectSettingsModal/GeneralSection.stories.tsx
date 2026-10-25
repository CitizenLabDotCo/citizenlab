import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { backofficeRedesignHandlers } from '../../../../../../../../.storybook/mocks/backofficeRedesign';

import GeneralSection from './GeneralSection';

// The general section of the project settings: where the project sits
// (space and folder) and its URL.

const meta = {
  title: 'Components/Redesigned/Setup panel/General section',
  tags: ['bo', 'redesigned'],
  component: GeneralSection,
  parameters: { msw: backofficeRedesignHandlers },
  args: {
    spaceId: null,
    folderId: null,
    projectInRoot: true,
    contextError: false,
    slug: 'plant-more-trees',
    currentSlug: 'plant-more-trees',
    showSlugErrorMessage: false,
    apiErrors: {},
    onContextChange: fn(),
    onSlugChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560, maxWidth: '100%', padding: 24, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GeneralSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A project at the top level with its URL. */
export const Default: Story = {};

/** The URL edited: a warning that old links break. */
export const SlugChanged: Story = {
  args: { slug: 'plant-trees-2026' },
};

/** An invalid URL. */
export const InvalidSlug: Story = {
  args: { slug: 'Plant trees!', showSlugErrorMessage: true },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
