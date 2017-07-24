import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/idea_statuses`;

export interface IIdeaStatus {
  [key: string]: any;
}

export function observeIdeaStatuses(streamParams: IStreamParams<IIdeaStatus[]> | null = null) {
  return streams.create<IIdeaStatus[]>({ apiEndpoint, ...streamParams });
}
