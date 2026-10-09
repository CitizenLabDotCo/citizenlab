import LightProjectCard from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/LightProjectCard',
  component: LightProjectCard,
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof LightProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const BASE_PROJECT = {
  attributes: {
    title_multiloc: {
      en: 'My cool project',
    },
    slug: 'my-cool-project',
    participation_status: 'active',
    days_until_start: null,
    days_since_end: null,
  },
  relationships: {
    project_images: {
      data: [
        {
          id: '1',
          type: 'project_image',
        },
      ],
    },
    highlighted_phase: {
      data: {
        id: '1',
      },
    },
  },
};

export const Primary: Story = {
  args: {
    project: BASE_PROJECT as any,
  },
};

export const UpcomingProject: Story = {
  args: {
    project: {
      ...BASE_PROJECT,
      attributes: {
        ...BASE_PROJECT.attributes,
        participation_status: 'upcoming',
        days_until_start: 10,
      },
    } as any,
  },
};

export const FinishedProject: Story = {
  args: {
    project: {
      ...BASE_PROJECT,
      attributes: {
        ...BASE_PROJECT.attributes,
        participation_status: 'ended',
        days_since_end: 15,
      },
    } as any,
  },
};
