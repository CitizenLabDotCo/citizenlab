import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';
import { apiEndpoint as projectsApiEndpoint } from './projects';

const apiEndpoint = `${API_PATH}/projects_allowed_input_topics`;

export interface IProjectAllowedInputTopicData {
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

export interface IProjectTopics {
  data: IProjectAllowedInputTopicData[];
}

export async function deleteProjectTopic(
  projectId: string,
  projectTopicId: string
) {
  const response = await streams.delete(
    `${apiEndpoint}/${projectTopicId}`,
    projectTopicId
  );
  await streams.fetchAllWith({
    apiEndpoint: [
      `${projectsApiEndpoint}/${projectId}/projects_allowed_input_topics`,
    ],
  });
  return response;
}

export async function addProjectTopic(projectId: string, topicId: string) {
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

export async function reorderProjectTopic(
  projectTopicId: string,
  newOrder: number,
  projectId: string
) {
  const response = await streams.update(
    `${apiEndpoint}/${projectTopicId}/reorder`,
    projectTopicId,
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

export function projectTopicsStream(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IProjectTopics>({
    apiEndpoint: `${projectsApiEndpoint}/${projectId}/projects_allowed_input_topics`,
    ...streamParams,
  });
}
