import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc, IRelationship } from 'typings';

export const apiEndpoint = `${API_PATH}/topics`;

type DefaultTopicCodes =
  | 'nature'
  | 'waste'
  | 'sustainability'
  | 'mobility'
  | 'technology'
  | 'economy'
  | 'housing'
  | 'public_space'
  | 'safety'
  | 'education'
  | 'culture'
  | 'health'
  | 'inclusion'
  | 'community'
  | 'services'
  | 'other';
export type Code = 'custom' | DefaultTopicCodes;

export interface ITopicData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    icon: string;
    ordering: number;
    code: Code;
    static_page_ids: string[];
  };
  relationships: {
    static_pages: {
      data: IRelationship[];
    };
  };
}

export interface ITopic {
  data: ITopicData;
}

export interface ITopics {
  data: ITopicData[];
}

export interface ITopicsQueryParams {
  code?: Code;
  exclude_code?: Code;
  sort?: 'new' | 'custom';
  for_homepage_filter?: boolean;
}

export interface ITopicUpdate {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
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
