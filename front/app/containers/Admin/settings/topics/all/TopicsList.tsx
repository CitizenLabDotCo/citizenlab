import React from 'react';

import { IGlobalTopicData } from 'api/global_topics/types';

import { List } from 'components/admin/ResourceList';

import TopicRow from './TopicRow';

interface Props {
  topics: IGlobalTopicData[];
  handleDeleteClick: (topicId: string) => (event: React.FormEvent<any>) => void;
}

export default ({ topics, handleDeleteClick }: Props) => (
  <List>
    {topics.map((topic, index) => {
      const isLastItem = index === topics.length - 1;

      return (
        <TopicRow
          key={topic.id}
          topic={topic}
          isLastItem={isLastItem}
          handleDeleteClick={handleDeleteClick}
        />
      );
    })}
  </List>
);
