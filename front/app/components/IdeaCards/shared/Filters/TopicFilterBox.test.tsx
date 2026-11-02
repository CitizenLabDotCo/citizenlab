import React from 'react';

import { IInputTopicData } from 'api/input_topics/types';

import { render, screen } from 'utils/testUtils/rtl';

import TopicFilterBox from './TopicFilterBox';

let mockTopics: IInputTopicData[] = [];

jest.mock('api/input_topics/useInputTopics', () =>
  jest.fn(() => ({ data: { data: mockTopics } }))
);
jest.mock('api/ideas_filter_counts/useIdeasFilterCounts', () =>
  jest.fn(() => ({
    data: {
      data: {
        type: 'filter_counts',
        attributes: {
          idea_status_id: {},
          area_id: {},
          input_topic_id: { topic1: 3 },
          total: 3,
        },
      },
    },
  }))
);

const topic: IInputTopicData = {
  id: 'topic1',
  type: 'input_topic',
  attributes: {
    title_multiloc: { en: 'Mobility' },
    description_multiloc: {},
    full_title_multiloc: { en: 'Mobility' },
    icon: null,
    parent_icon: null,
    depth: 0,
    lft: 1,
    rgt: 2,
    children_count: 0,
  },
  relationships: {
    project: { data: { id: 'project1', type: 'project' } },
  },
};

const renderTopicFilterBox = () =>
  render(
    <TopicFilterBox
      projectId="project1"
      selectedTopicIds={null}
      ideaQueryParameters={{}}
      onChange={jest.fn()}
    />
  );

describe('TopicFilterBox', () => {
  it('renders nothing when the project has no input tags', () => {
    mockTopics = [];
    renderTopicFilterBox();

    expect(screen.queryByText(/^topics$/i)).not.toBeInTheDocument();
    expect(screen.queryByText('No values available.')).not.toBeInTheDocument();
  });

  it('lists the project tags that have inputs', () => {
    mockTopics = [topic];
    renderTopicFilterBox();

    expect(screen.getByText('Mobility')).toBeInTheDocument();
  });
});
