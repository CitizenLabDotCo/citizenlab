import { IUpdatedProjectProperties, IProjectData } from 'api/projects/types';

export function getSelectedTopicIds(
  projectAttributesDiff: IUpdatedProjectProperties,
  project: IProjectData | null
) {
  if (projectAttributesDiff.global_topic_ids) {
    return projectAttributesDiff.global_topic_ids;
  }

  if (project) {
    return project.relationships.global_topics.data.map((topic) => topic.id);
  }

  return [];
}
