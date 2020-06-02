import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { ITopics } from 'services/topics';
import { IProject } from 'services/projects';

const apiEndpoint = `${API_PATH}/projects`;

export async function deleteProjectTopic(projectId: string, topicId: string) {
  const response = streams.delete(`${apiEndpoint}/${projectId}/topics/${topicId}`, topicId);
  // line below to be checked
  await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/topics`, `${API_PATH}/projects/${projectId}/topics`] });
  return response;
}

export async function addProjectTopic(projectId: string, topicId: string) {
  const response = streams.add(`${apiEndpoint}/${projectId}/topics`, { topic_id: topicId });
  // line below to be checked
  await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/topics`, `${API_PATH}/projects/${projectId}/topics`] });
  return response;
}

export async function reorderProjectTopic(
  projectId: string,
  topicId: string,
  newOrder: number
) {
  return streams.update<IProject>(
    `projects/${projectId}/topics/${topicId}/reorder`,
    projectId,
    {
      topic: {
        ordering: newOrder
      }
    }
  );
}

export function projectTopicsStream(projectId: string, streamParams: IStreamParams | null = null) {
  return streams.get<ITopics>({ apiEndpoint: `${apiEndpoint}/${projectId}/topics`, ...streamParams });
}
