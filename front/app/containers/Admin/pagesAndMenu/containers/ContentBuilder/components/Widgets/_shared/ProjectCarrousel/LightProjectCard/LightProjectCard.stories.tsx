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
    action_descriptors: {
      posting_idea: { enabled: true },
      reacting_idea: { enabled: false },
      commenting_idea: { enabled: true },
    },
    starts_days_from_now: null,
    ended_days_ago: null,
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
    current_phase: {
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
        starts_days_from_now: 10,
      },
      relationships: {
        project_images: BASE_PROJECT.relationships.project_images,
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
        ended_days_ago: 15,
      },
      relationships: {
        project_images: BASE_PROJECT.relationships.project_images,
      },
    } as any,
  },
};
