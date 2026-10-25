import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import {
  backofficeRedesignHandlers,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import { projectWith } from '../../../../../../../../.storybook/mocks/backofficeRedesignSetupPanel';

import AreaFilterDropdown from './AreaFilterDropdown';

// The Areas picker in the setup panel: which areas of the city the project
// is about, none, all, or a selection. It opens a menu of the three options;
// "Selected areas" adds a checklist of the platform's areas.

const openPicker = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const trigger = await within(canvasElement).findByRole('button', {
    expanded: false,
  });
  await userEvent.click(trigger);
};

const meta = {
  title: 'Components/Redesigned/Setup panel/Area filter dropdown',
  tags: ['bo', 'redesigned'],
  component: AreaFilterDropdown,
  parameters: { msw: backofficeRedesignHandlers },
  args: { project: projectWith({ include_all_areas: false }) },
  decorators: [
    (Story) => (
      <div style={{ width: 292, minHeight: 120, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Area filter');
  },
} satisfies Meta<typeof AreaFilterDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed, no areas picked. */
export const Default: Story = {};

/** Opened: the three options. */
export const Open: Story = {
  decorators: [
    (Story) => (
      <div style={{ minHeight: 420 }}>
        <Story />
      </div>
    ),
  ],
  play: openPicker,
};

/** Two areas picked: their names on the button. */
export const SelectedAreas: Story = {
  args: {
    project: projectWith(
      { include_all_areas: false },
      {
        areas: {
          data: [
            { id: 'bo-area-1', type: 'area' },
            { id: 'bo-area-3', type: 'area' },
          ],
        },
      }
    ),
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'North district, Harbour');
  },
};

/** Two areas picked, opened: the checklist under "Selected areas". */
export const SelectedAreasOpen: Story = {
  args: SelectedAreas.args,
  decorators: [
    (Story) => (
      <div style={{ minHeight: 620 }}>
        <Story />
      </div>
    ),
  ],
  play: async (context) => {
    await waitForText(context.canvasElement, 'North district, Harbour');
    await openPicker(context);
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  decorators: Open.decorators,
  play: openPicker,
};
