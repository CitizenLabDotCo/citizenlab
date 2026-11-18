import React from 'react';

import { mockInputTopic } from 'api/input_topics/__mocks__/data';

import { render, screen } from 'utils/testUtils/rtl';

import TopicsFilter from './TopicsFilter';

const renderFilter = (inputCount: number) =>
  render(
    <TopicsFilter
      topics={[mockInputTopic]}
      selectedTopicIds={['topic1']}
      onChange={jest.fn()}
      filterCounts={{
        idea_status_id: {},
        area_id: {},
        input_topic_id: { topic1: inputCount },
        total: inputCount,
      }}
    />
  );

describe('TopicsFilter', () => {
  it('announces the selected tags once', () => {
    renderFilter(3);

    expect(screen.getAllByText(/^selected one topic filter/i)).toHaveLength(1);
  });

  it('announces the selected tags once when no tag has inputs', () => {
    renderFilter(0);

    expect(screen.getAllByText(/^selected one topic filter/i)).toHaveLength(1);
  });
});
