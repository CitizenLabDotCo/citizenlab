import { IProjectAllowedInputTopic } from '../types';

export function getTopicIds(
  projectAllowedInputTopics: IProjectAllowedInputTopic[] | undefined
) {
  return !projectAllowedInputTopics
    ? []
    : projectAllowedInputTopics.map((projectAllowedInputTopic) => {
        return projectAllowedInputTopic.relationships.topic.data.id;
      });
}
