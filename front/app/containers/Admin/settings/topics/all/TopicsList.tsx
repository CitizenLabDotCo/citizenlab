import React from 'react';

import { ITopicData } from 'api/topics/types';

import { List } from 'components/admin/ResourceList';
import TopicRow from './TopicRow';

interface Props {
  topics: ITopicData[];
  handleDeleteClick: (topicId: string) => (event: React.FormEvent<any>) => void;
}

export default ({ topics, handleDeleteClick }: Props) => (
  <List>
    {topics.map((topic, index) => {
      const isLastItem = index === topics.length - 1;

      const isDefaultTopic = topic.attributes.code !== 'custom';

      return (
        <TopicRow
          key={topic.id}
          topic={topic}
          isLastItem={isLastItem}
          handleDeleteClick={isDefaultTopic ? undefined : handleDeleteClick}
        />
      );
    })}
  </List>
);
