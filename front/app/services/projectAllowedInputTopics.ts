import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship } from 'typings';
import { apiEndpoint as projectsApiEndpoint } from './projects';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

const apiEndpoint = `${API_PATH}/projects_allowed_input_topics`;
const getListEndpoint = (projectId: string) =>
  `${projectsApiEndpoint}/${projectId}/projects_allowed_input_topics`;

export interface IProjectAllowedInputTopic {
  id: string;
  type: 'projects_allowed_input_topic';
  attributes: {
    ordering: number;
  };
  relationships: {
    project: {
      data: IRelationship;
    };
    topic: {
      data: IRelationship;
    };
  };
}

export interface IProjectAllowedInputTopics {
  data: IProjectAllowedInputTopic[];
}

export async function deleteProjectAllowedInputTopic(
  projectId: string,
  allowedInputTopicId: string
) {
  const response = await streams.delete(
    `${apiEndpoint}/${allowedInputTopicId}`,
    allowedInputTopicId
  );

  await streams.fetchAllWith({
    apiEndpoint: [getListEndpoint(projectId)],
  });

  return response;
}

export async function addProjectAllowedInputTopic(
  projectId: string,
  topicId: string
) {
  const response = await streams.add(apiEndpoint, {
    project_id: projectId,
    topic_id: topicId,
  });

  await streams.fetchAllWith({
    apiEndpoint: [getListEndpoint(projectId)],
  });

  return response;
}

export function listProjectAllowedInputTopics(projectId: string) {
  return streams.get<IProjectAllowedInputTopics>({
    apiEndpoint: getListEndpoint(projectId),
  });
}

export async function reorderProjectAllowedInputTopic(
  allowedInputTopicId: string,
  newOrder: number,
  projectId: string
) {
  const response = await streams.update(
    `${apiEndpoint}/${allowedInputTopicId}/reorder`,
    allowedInputTopicId,
    {
      projects_allowed_input_topic: {
        ordering: newOrder,
      },
    }
  );

  await streams.fetchAllWith({
    apiEndpoint: [getListEndpoint(projectId)],
  });

  return response;
}

export function getTopicIds(
  projectAllowedInputTopics: IProjectAllowedInputTopic[] | NilOrError
) {
  return isNilOrError(projectAllowedInputTopics)
    ? []
    : projectAllowedInputTopics.map((projectAllowedInputTopic) => {
        return projectAllowedInputTopic.relationships.topic.data.id;
      });
}
