import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/topics`;

export interface ITopic {
  [key: string]: any;
}

export function observeTopics(streamParams: IStreamParams<ITopic[]> | null = null) {
  return streams.create<ITopic[]>({ apiEndpoint, ...streamParams });
}
