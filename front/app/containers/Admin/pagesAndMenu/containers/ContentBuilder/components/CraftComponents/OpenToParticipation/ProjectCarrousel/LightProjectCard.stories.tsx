import { getOrigin } from 'utils/storybook/getOrigin';

import LightProjectCard from './LightProjectCard';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/LightProjectCard',
  component: LightProjectCard,
} satisfies Meta<typeof LightProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'Amazing project',
    imageUrl: `${getOrigin()}/images/image16.png`,
    currentPhaseEndsAt: '2024-12-12',
  },
};
