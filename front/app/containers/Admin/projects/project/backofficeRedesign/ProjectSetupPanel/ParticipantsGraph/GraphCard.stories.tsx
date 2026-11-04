import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';

import GraphCard from './GraphCard';

// The participants card in the setup panel of a live project: the total,
// how many joined last week, and a sparkline of the weeks since launch.
// It links to the project's audience page.

// One week of data only: the total without a sparkline.
const oneWeekHandler = http.get(
  '/web_api/v1/reports/graph_data_units/live',
  ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('resolved_name') !== 'ParticipantsWidget') {
      return undefined;
    }
    return HttpResponse.json({
      data: {
        type: 'report_builder_data_units',
        attributes: {
          participants_timeseries: [
            {
              date_group: new Date().toISOString().slice(0, 10),
              participants: 4,
            },
          ],
          participants_whole_period: 4,
          participation_rate_whole_period: 0.01,
          participants_compared_period: 0,
          participation_rate_compared_period: 0,
        },
      },
    });
  }
);

const meta = {
  title: 'Components/Redesigned/Setup panel/Participants graph card',
  tags: ['bo', 'redesigned'],
  component: GraphCard,
  parameters: { msw: backofficeRedesignHandlers },
  args: { projectId: project1.id },
  decorators: [
    (Story) => (
      <div style={{ width: 292, padding: '0 20px', background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '31');
  },
} satisfies Meta<typeof GraphCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 31 participants, 8 last week, eight weeks of sparkline. */
export const Default: Story = {};

/** Hovered: the card darkens. */
export const Hover: Story = {
  parameters: { pseudo: { hover: ['a'] } },
};

/** Just launched: the total, no trend or sparkline yet. */
export const JustLaunched: Story = {
  parameters: { msw: [oneWeekHandler, ...backofficeRedesignHandlers] },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '4');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, '31');
  },
};
