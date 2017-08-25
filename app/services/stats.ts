import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/stats`;

export interface IUsersByGender {
  [key: string]: number;
}

export interface IUsersByBirthyear{
  [key: string]: number;
}

export interface IIdeasByTime{
  [key: string]: number;
}

export interface IUsersByTime{
  [key: string]: number;
}

export interface IIdeasByTopic{
  data: {
    [key: string]: number;
  },
  topics: {
    [key: string]: {
      title_multiloc: {
        [key: string]: string,
      }
    }
  }
}

export function observeUsersByGender(streamParams: IStreamParams<IUsersByGender> | null = null) {
  return streams.create<IUsersByGender>({ apiEndpoint: `${apiEndpoint}/users_by_gender`, ...streamParams });
}

export function observeUsersByBirthyear(streamParams: IStreamParams<IUsersByBirthyear> | null = null) {
  return streams.create<IUsersByBirthyear>({ apiEndpoint: `${apiEndpoint}/users_by_birthyear`, ...streamParams });
}

export function observeIdeasByTime(streamParams: IStreamParams<IIdeasByTime> | null = null) {
  return streams.create<IIdeasByTime>({ apiEndpoint: `${apiEndpoint}/ideas_by_time`, ...streamParams });
}

export function observeUsersByTime(streamParams: IStreamParams<IUsersByTime> | null = null) {
  return streams.create<IUsersByTime>({ apiEndpoint: `${apiEndpoint}/users_by_time`, ...streamParams });
}

export function observeIdeasByTopic(streamParams: IStreamParams<IIdeasByTopic> | null = null) {
  return streams.create<IIdeasByTopic>({ apiEndpoint: `${apiEndpoint}/ideas_by_topic`, ...streamParams });
}
