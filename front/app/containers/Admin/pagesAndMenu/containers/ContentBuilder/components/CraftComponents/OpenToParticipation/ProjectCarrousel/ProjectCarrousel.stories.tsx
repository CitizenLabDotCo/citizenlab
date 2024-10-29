import React, { useState } from 'react';

import { projects } from 'api/projects/__mocks__/_mockServer';

import ProjectCarrousel from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/ProjectCarrousel',
  component: ProjectCarrousel,
} satisfies Meta<typeof ProjectCarrousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const createData = (offset: number) => {
  return [...projects.data, ...projects.data, ...projects.data].map(
    (project, index) => ({
      ...project,
      id: (offset + index).toString(),
      attributes: {
        ...project.attributes,
        title_multiloc: {
          ...project.attributes.title_multiloc,
          en: `${offset + index} ${
            project.attributes.title_multiloc.en as any
          }`,
        },
      },
    })
  );
};

const PrimaryWrapper = ({ title }) => {
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

export const Primary: Story = {
  args: {
    title: 'Open to participation',
    // The next three props are not used in the component, but are required for the story to work
    projects: [],
    hasMore: true,
    onLoadMore: () => {},
  },
  render: ({ title }) => {
    return <PrimaryWrapper title={title} />;
  },
};
