import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';

import ListingCard from './ListingCard';

// The listing card in the setup panel: the image the project shows on its
// card in project lists, with its alt text and a save button. It sits
// folded in the panel; the stories open it.

const expand = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await waitForText(canvasElement, 'Listing');
  const toggle = await within(canvasElement).findByRole('button', {
    expanded: false,
  });
  await userEvent.click(toggle);
};

const noImagesHandler = http.get('/web_api/v1/projects/:projectId/images', () =>
  HttpResponse.json({ data: [] })
);

const meta = {
  title: 'Components/Redesigned/Setup panel/Listing card',
  tags: ['bo', 'redesigned'],
  component: ListingCard,
  parameters: { msw: backofficeRedesignHandlers },
  args: { projectId: project1.id },
  decorators: [
    (Story) => (
      <div style={{ width: 292, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: expand,
} satisfies Meta<typeof ListingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A card image set, with its alt text field. */
export const Default: Story = {};

/** No card image yet: the drop zone. */
export const Empty: Story = {
  parameters: { msw: [noImagesHandler, ...backofficeRedesignHandlers] },
};

/** Folded, as it first shows in the panel. */
export const Collapsed: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Listing');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async ({ canvasElement }) => {
    const toggle = await within(canvasElement).findByRole('button', {
      expanded: false,
    });
    await userEvent.click(toggle);
  },
};
