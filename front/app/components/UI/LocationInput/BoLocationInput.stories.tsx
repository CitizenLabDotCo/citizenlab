import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { fn, userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../.storybook/mocks/backofficeRedesign';

import LocationInput from '.';

// The back-office location search of the event page: a react-select with a
// thin grey border, an 8px radius, a magnifier inset on the left and no
// dropdown chevron.

const autocomplete = http.get('/web_api/v1/location/autocomplete', () =>
  HttpResponse.json({
    data: {
      type: 'location_autocomplete',
      attributes: {
        results: [
          'Mutsaardstraat 31, 2000 Antwerpen, Belgium',
          'Mutsaardstraat 1, 2000 Antwerpen, Belgium',
          'Mutsaardplein, 2000 Antwerpen, Belgium',
        ],
      },
    },
  })
);

const meta = {
  title: 'Components/Redesigned/Library variants/Back-office location search',
  tags: ['bo', 'redesigned'],
  component: LocationInput,
  parameters: { msw: [autocomplete] },
  args: {
    variant: 'bo',
    placeholder: 'Search for an address',
    value: null,
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <Box w="320px" minHeight="220px" p="24px" background="white">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof LocationInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty, with its placeholder. */
export const Default: Story = {};

/** An address picked. */
export const Filled: Story = {
  args: {
    value: {
      value: 'Mutsaardstraat 31, 2000 Antwerpen, Belgium',
      label: 'Mutsaardstraat 31, 2000 Antwerpen, Belgium',
    },
  },
};

/** Typing: the suggestions open below. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.type(input, 'Mutsaard');
    await waitForText(canvasElement, 'Mutsaardplein');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    value: {
      value: 'Mutsaardstraat 31, 2000 Antwerpen, Belgium',
      label: 'Mutsaardstraat 31, 2000 Antwerpen, Belgium',
    },
  },
};
