import EventCard from './EventCard';

import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Cards/EventCard',
  component: EventCard,
  render: (props) => (
    <Box w="300px">
      <EventCard {...props} />
    </Box>
  ),
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    event: {
      id: '1',
      type: 'event',
      attributes: {
        title_multiloc: {
          en: 'Council Meeting',
        },
        description_multiloc: {
          en: '<p>During this council meeting, those citizen initiatives that gained 100 reactions in less than 3 months, will be presented.</p><p>The council will then share their view on each idea.</p>',
        },
        location_multiloc: { en: 'Town hall' },
        address_2_multiloc: {
          en: 'Rue de la Loi 200',
        },
        address_1: 'Brussels',
        location_point_geojson: {
          type: 'Point',
          coordinates: [4.3517103, 50.8503396],
        },
        start_at: '2023-02-03T09:00:00.000Z',
        end_at: '2023-02-03T12:00:00.000Z',
        created_at: '2021-03-03T09:00:00.000Z',
        updated_at: '2021-03-03T09:00:00.000Z',
        attendees_count: 10,
      },
      relationships: {
        event_images: {
          data: [],
        },
      } as any,
    },
  },
};
