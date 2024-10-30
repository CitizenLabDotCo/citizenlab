import React, { useState } from 'react';

import { MiniProjectData } from 'api/projects_mini/types';

import ProjectCarrousel from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/ProjectCarrousel',
  component: ProjectCarrousel,
} satisfies Meta<typeof ProjectCarrousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const createData = (offset: number): MiniProjectData[] => {
  return Array.from({ length: 6 }).map((_, index) => ({
    id: (offset + index).toString(),
    type: 'project_mini',
    attributes: {
      title_multiloc: {
        en: `${offset + index} - Project title`,
      },
      slug: 'project-slug',
      action_descriptors: {
        posting_idea: { enabled: true },
        reacting_idea: { enabled: false },
        commenting_idea: { enabled: true },
      } as any,
    },
    relationships: {
      current_phase: {
        data: {
          id: 'phase-id',
        },
      },
      project_images: {
        data: [],
      },
    },
  }));
};

const ManyProjectsWrapper = ({ title }) => {
  const [data, setData] = useState(createData(1));
  const [hasMore, setHasMore] = useState(true);

  return (
    <div style={{ width: '100%', maxWidth: '600px', padding: '8px' }}>
      <ProjectCarrousel
        title={title}
        projects={data}
        hasMore={hasMore}
        onLoadMore={() => {
          setTimeout(() => {
            setData([...data, ...createData(data.length + 1)]);
            setHasMore(false);
          }, 2000);
        }}
      />
    </div>
  );
};

export const ManyProjects: Story = {
  args: {
    title: 'Open to participation',
    // The next three props are not used in the component, but are required for the story to work
    projects: [],
    hasMore: true,
    onLoadMore: () => {},
  },
  render: ({ title }) => {
    return <ManyProjectsWrapper title={title} />;
  },
};

export const OneProject: Story = {
  args: {
    title: 'Open to participation',
    projects: [createData(0)[0]],
    hasMore: false,
    onLoadMore: () => {},
  },
};
