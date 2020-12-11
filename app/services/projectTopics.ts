import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

export interface IProjectTopicData {
  id: string;
  type: 'projects_topic';
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

export interface IProjectTopic {
  data: IProjectTopicData;
}

export interface IProjectTopics {
  data: IProjectTopicData[];
}

const apiEndpoint = `${API_PATH}/projects`;

export async function deleteProjectTopic(
  projectId: string,
  projectTopicId: string
) {
  const response = await streams.delete(
    `${API_PATH}/projects_topics/${projectTopicId}`,
    projectTopicId
  );
  await streams.fetchAllWith({
    apiEndpoint: [`${apiEndpoint}/${projectId}/projects_topics`],
  });
  return response;
}

export async function addProjectTopic(projectId: string, topicId: string) {
  const response = await streams.add(`${API_PATH}/projects_topics`, {
    project_id: projectId,
    topic_id: topicId,
  });
  await streams.fetchAllWith({
    apiEndpoint: [`${apiEndpoint}/${projectId}/projects_topics`],
  });
  return response;
}

export async function reorderProjectTopic(
  projectTopicId: string,
  newOrder: number,
  projectId: string
) {
  const response = await streams.update(
    `${API_PATH}/projects_topics/${projectTopicId}/reorder`,
    projectTopicId,
    {
      projects_topic: {
        ordering: newOrder,
      },
    }
  );

  streams.fetchAllWith({
    apiEndpoint: [`${apiEndpoint}/${projectId}/projects_topics`],
  });

  return response;
}

export function projectTopicsStream(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IProjectTopics>({
    apiEndpoint: `${apiEndpoint}/${projectId}/projects_topics`,
    ...streamParams,
  });
}
