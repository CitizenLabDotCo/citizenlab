import SpotlightProject from './SpotlightProject';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/SpotlightProject',
  component: SpotlightProject,
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof SpotlightProject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    title: 'People at the Heart of Everything We Do',
    description:
      'Join local projects, sharing your ideas, or contributing to discussions, your voice is key to building a better Newham.',
    buttonText: 'Join other residents',
  },
  parameters: {},
};
