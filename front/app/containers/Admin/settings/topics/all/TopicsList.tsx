import React from 'react';

import { ITopicData } from 'api/topics/types';

import { List } from 'components/admin/ResourceList';

import CustomTopicRow from './CustomTopicRow';
import DefaultTopicRow from './DefaultTopicRow';

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
