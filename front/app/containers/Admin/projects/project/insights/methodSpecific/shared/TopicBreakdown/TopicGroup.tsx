import React from 'react';

import BarRow from 'design-system/BarRow';
import EmptyState from 'design-system/EmptyState';
import ExpandableRow from 'design-system/ExpandableRow';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { TopicData } from './useTopicBreakdownData';

type Props = {
  title: string;
  // For example "34 inputs · 0 topics".
  summary: string;
  topics: TopicData[];
  emptyMessage: string;
};

const TopicGroup = ({ title, summary, topics, emptyMessage }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <ExpandableRow title={title} summary={summary}>
      {topics.length === 0 ? (
        <EmptyState context="card">{emptyMessage}</EmptyState>
      ) : (
        topics.map((topic) => (
          <BarRow
            key={topic.id}
            label={topic.name}
            value={formatMessage(messages.shareAndCount, {
              percentage: topic.percentage,
              count: topic.count,
            })}
            share={topic.percentage / 100}
          />
        ))
      )}
    </ExpandableRow>
  );
};

export default TopicGroup;
