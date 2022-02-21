import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship } from 'typings';
import { apiEndpoint as projectsApiEndpoint } from './projects';

const apiEndpoint = `${API_PATH}/projects_allowed_input_topics`;

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

export interface IProjectAllowedInputTopicsResponse {
  data: IProjectAllowedInputTopic[];
}

export interface IProjectAllowedInputTopicResponse {
  data: IProjectAllowedInputTopic;
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
    apiEndpoint: [
      `${projectsApiEndpoint}/${projectId}/projects_allowed_input_topics`,
    ],
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
    apiEndpoint: [
      `${projectsApiEndpoint}/${projectId}/projects_allowed_input_topics`,
    ],
  });
  return response;
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

  streams.fetchAllWith({
    apiEndpoint: [
      `${projectsApiEndpoint}/${projectId}/projects_allowed_input_topics`,
    ],
  });

  return response;
}

export function projectAllowedInputTopicStream(allowedInputTopicId: string) {
  return streams.get<IProjectAllowedInputTopicResponse>({
    apiEndpoint: `${apiEndpoint}/${allowedInputTopicId}`,
  });
}
