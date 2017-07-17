import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/areas`;

export interface IArea {
  [key: string]: any;
}

export function observeAreas(streamParams: IStreamParams<IArea[]> | null = null) {
  return streams.create<IArea[]>({ apiEndpoint, ...streamParams });
}
