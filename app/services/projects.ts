import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/projects`;

export interface IProject {
  [key: string]: any;
}

export function observeProjects(streamParams: IStreamParams<IProject[]> | null = null) {
  return streams.create<IProject[]>({ apiEndpoint, ...streamParams });
}
