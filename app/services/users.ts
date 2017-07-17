import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/users`;

export interface IUser {
  [key: string]: any;
}

export function observeUsers(streamParams: IStreamParams<IUser[]> | null = null) {
  return streams.create<IUser[]>({ apiEndpoint, ...streamParams });
}
