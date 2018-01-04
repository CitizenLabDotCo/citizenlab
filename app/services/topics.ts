import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/topics`;

export interface ITopicData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    icon: string;
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

export function topicsStream(streamParams: IStreamParams<ITopics> | null = null) {
  return streams.get<ITopics>({ apiEndpoint, ...streamParams });
}
