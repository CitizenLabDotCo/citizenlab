import React from 'react';

// components
import { List } from 'components/admin/ResourceList';
import DefaultTopicRow from './DefaultTopicRow';
import CustomTopicRow from './CustomTopicRow';

// typings
import { ITopicData } from 'api/topics/types';

interface Props {
  topics: ITopicData[];
  handleDeleteClick: (topicId: string) => (event: React.FormEvent<any>) => void;
}

export default ({ topics, handleDeleteClick }: Props) => (
  <List>
    {topics.map((topic, index) => {
      const isLastItem = index === topics.length - 1;

      const isDefaultTopic = topic.attributes.code !== 'custom';

      return isDefaultTopic ? (
        <DefaultTopicRow topic={topic} isLastItem={isLastItem} />
      ) : (
        <CustomTopicRow
          topic={topic}
          isLastItem={isLastItem}
          handleDeleteClick={handleDeleteClick}
        />
      );
    })}
  </List>
);
