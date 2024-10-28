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
    project: {
      attributes: {
        title_multiloc: {
          en: 'My cool project',
        },
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
      },
    } as any,
    phase: {
      attributes: {
        participation_method: 'ideation',
      },
    } as any,
  },
};
