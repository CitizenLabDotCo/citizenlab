import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

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
  };
}

export interface ITopic {
  data: ITopicData;
}

export interface ITopics {
  data: ITopicData[];
}

export function topicByIdStream(topicId: string) {
  return streams.get<ITopic>({ apiEndpoint: `${apiEndpoint}/${topicId}` });
}

export function topicsStream(streamParams: IStreamParams | null = null) {
  return streams.get<ITopics>({ apiEndpoint, ...streamParams });
}
