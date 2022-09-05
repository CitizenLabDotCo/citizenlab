import streams from 'utils/streams';
import { Multiloc } from 'typings';
import { apiEndpoint, ITopic } from 'services/topics';

export interface ITopicUpdate {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export async function addTopic(object: ITopicUpdate) {
  const response = await streams.add<ITopic>(apiEndpoint, { topic: object });
  await streams.fetchAllWith({ apiEndpoint: [apiEndpoint] });
  return response;
}

export async function updateTopic(topicId: string, object: ITopicUpdate) {
  const response = await streams.update<ITopic>(
    `${apiEndpoint}/${topicId}`,
    topicId,
    {
      topic: object,
    }
  );

  await streams.fetchAllWith({ apiEndpoint: [apiEndpoint] });
  return response;
}

export async function deleteTopic(topicId: string) {
  const response = await streams.delete(`${apiEndpoint}/${topicId}`, topicId);
  await streams.fetchAllWith({ apiEndpoint: [apiEndpoint] });

  return response;
}
