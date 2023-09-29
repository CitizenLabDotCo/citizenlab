import type { Meta, StoryObj } from '@storybook/react';

import InitiativeCard from '.';

const meta = {
  title: 'Example/InitiativeCard',
  component: InitiativeCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InitiativeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    initiativeId: '1',
  },
  parameters: {},
};
