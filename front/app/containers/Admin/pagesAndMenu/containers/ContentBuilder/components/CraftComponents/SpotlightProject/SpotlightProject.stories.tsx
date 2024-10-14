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
    title_multiloc: { en: 'Spotlight Project' },
  },
  parameters: {},
};
