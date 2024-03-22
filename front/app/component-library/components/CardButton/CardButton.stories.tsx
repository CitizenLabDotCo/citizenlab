import CardButton from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/CardButton',
  component: CardButton,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CardButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    iconName: 'close',
    title: 'Close',
    subtitle: 'close',
    mr: '8px',
    selected: true,
  },
};

export const LongTitle: Story = {
  args: {
    iconName: 'close',
    title: 'Looong title with many words and such',
    subtitle: 'close',
    mr: '8px',
    selected: true,
  },
};
