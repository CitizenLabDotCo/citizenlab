import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship } from 'typings';
import { apiEndpoint as projectsApiEndpoint } from './projects';

const apiEndpoint = `${API_PATH}/projects_allowed_input_topics`;

export const getListEndpoint = (projectId: string) =>
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
