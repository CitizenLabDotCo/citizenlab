import React from 'react';

import { IInputTopicData } from 'api/input_topics/types';

import { render, screen } from 'utils/testUtils/rtl';

import TopicFilterBox from './TopicFilterBox';

let mockTopics: IInputTopicData[] = [];
let mockTopicsFieldEnabled = true;

jest.mock('api/custom_fields/useCustomFields', () =>
  jest.fn(() => ({
    data: [{ key: 'topic_ids', enabled: mockTopicsFieldEnabled }],
  }))
);
jest.mock('api/input_topics/useInputTopics', () =>
  jest.fn(() => ({ data: { data: mockTopics } }))
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
      filterCounts={{
        idea_status_id: {},
        area_id: {},
        input_topic_id: { topic1: 3 },
        total: 3,
      }}
      onChange={jest.fn()}
    />
  );

describe('TopicFilterBox', () => {
  beforeEach(() => {
    mockTopicsFieldEnabled = true;
  });

  it('renders nothing when the project has no input tags', () => {
    mockTopics = [];
    renderTopicFilterBox();

    expect(screen.queryByText(/^topics$/i)).not.toBeInTheDocument();
    expect(screen.queryByText('No values available.')).not.toBeInTheDocument();
  });

  it('renders nothing when the tags field is disabled in the input form', () => {
    mockTopics = [topic];
    mockTopicsFieldEnabled = false;
    renderTopicFilterBox();

    expect(screen.queryByText(/^topics$/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Mobility')).not.toBeInTheDocument();
  });

  it('lists the project tags that have inputs', () => {
    mockTopics = [topic];
    renderTopicFilterBox();

    expect(screen.getByText('Mobility')).toBeInTheDocument();
  });
});
