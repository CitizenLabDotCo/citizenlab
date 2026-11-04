import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import {
  backofficeRedesignHandlers,
  waitForText,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';

import PreviewInfoCard from './PreviewInfoCard';

// The information card at the bottom of the event preview, as the event
// page shows it on a phone: the dates, the register button, how many are
// coming, the place and the online link.

const at = (daysFromNow: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const meta = {
  title: 'Components/Redesigned/Events/Preview info card',
  tags: ['bo', 'redesigned'],
  component: PreviewInfoCard,
  parameters: { msw: backofficeRedesignHandlers },
  args: {
    startAt: at(12, 10),
    endAt: at(12, 12),
    attendeesCount: 14,
    address1: 'Koekenbakstraat 1, Antwerp',
    address2Multiloc: {},
    hasLocationPoint: true,
    onlineLink: null,
    buttonText: 'Register',
    showButtonIcon: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 343, padding: 16, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Register');
  },
} satisfies Meta<typeof PreviewInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A morning event in a park, 14 people coming. */
export const Default: Story = {};

/** Over three days, with directions in the address details. */
export const MultiDay: Story = {
  args: {
    startAt: at(20, 9),
    endAt: at(22, 17),
    address2Multiloc: { en: 'Meet at the blue tent by the playground' },
  },
};

/** Online only, with a custom register button. */
export const Online: Story = {
  args: {
    address1: null,
    hasLocationPoint: false,
    onlineLink: 'https://meet.example.org/tree-plan',
    buttonText: 'Save my seat',
    showButtonIcon: false,
    attendeesCount: 0,
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Save my seat');
  },
};

/** An event that has already taken place. */
export const Past: Story = {
  args: { startAt: at(-30, 18), endAt: at(-30, 21), attendeesCount: 22 },
  play: async () => {},
};

export const LongContent: Story = {
  args: {
    address1:
      'Koninklijke Academie voor Schone Kunsten, Mutsaardstraat 31, 2000 Antwerpen, Belgium',
    address2Multiloc: {
      en: 'Second floor, the big room at the end of the corridor, next to the library.',
    },
    onlineLink:
      'https://meet.example.org/a-very-long-meeting-link-for-the-tree-plan-session',
    attendeesCount: 128,
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
