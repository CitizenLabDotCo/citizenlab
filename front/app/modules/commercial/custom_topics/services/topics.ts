import streams from 'utils/streams';
import { apiEndpoint, ITopic } from 'services/topics';

export async function addTopic(object) {
  const response = await streams.add<ITopic>(apiEndpoint, { topic: object });
  await streams.fetchAllWith({ apiEndpoint: [apiEndpoint] });
  return response;
}

export function updateTopic(topicId: string, object) {
  return streams.update<ITopic>(`${apiEndpoint}/${topicId}`, topicId, {
    topic: object,
  });
}

export function deleteTopic(topicId: string) {
  return streams.delete(`${apiEndpoint}/${topicId}`, topicId);
}
