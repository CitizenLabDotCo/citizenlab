import { IProjectAllowedInputTopicData } from '../types';

export function getTopicIds(
  projectAllowedInputTopics: IProjectAllowedInputTopicData[] | undefined
) {
  return !projectAllowedInputTopics
    ? []
    : projectAllowedInputTopics.map((projectAllowedInputTopic) => {
        return projectAllowedInputTopic.relationships.topic.data.id;
      });
}
