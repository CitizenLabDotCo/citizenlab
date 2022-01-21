import { API_PATH } from 'containers/App/constants';
import { Multiloc } from 'typings';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/stats`;

export interface IUsersByGender {
  series: {
    users: {
      [key: string]: number;
    };
  };
}

export interface IUsersByRegistrationField {
  series: {
    users: {
      [key: string]: number;
    };
  };
  options: {
    [key: string]: {
      title_multiloc: Multiloc;
    };
  };
}

export interface IUsersByDomicile {
  series: {
    users: {
      [key: string]: number;
    };
  };
  areas: {
    [key: string]: {
      title_multiloc: Multiloc;
    };
  };
}

export interface IUsersByBirthyear {
  series: {
    users: {
      [key: string]: number;
    };
  };
}

interface IGenderCounts {
  male?: number;
  female?: number;
  unspecified?: number;
  _blank?: number;
}

export interface IVotesByGender {
  series: {
    up: IGenderCounts;
    down: IGenderCounts;
    total: IGenderCounts;
  };
}

export interface IVotesByBirthyear {
  series: {
    up: { [key: number]: number };
    down: { [key: number]: number };
    total: { [key: number]: number };
  };
}

export interface IVotesByDomicile {
  series: {
    up: { [key: string]: number };
    down: { [key: string]: number };
    total: { [key: string]: number };
  };
}

export const usersByRegFieldXlsxEndpoint = (customFieldId: string) =>
  `${apiEndpoint}/users_by_custom_field_as_xlsx/${customFieldId}`;

export function usersByRegFieldStream(
  streamParams: IStreamParams | null = null,
  customFieldId: string
) {
  return streams.get<IUsersByRegistrationField>({
    apiEndpoint: `${apiEndpoint}/users_by_custom_field/${customFieldId}`,
    ...streamParams,
    cacheStream: false,
  });
}

export const usersByBirthyearXlsxEndpoint = `${apiEndpoint}/users_by_birthyear_as_xlsx`;

export function usersByBirthyearStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUsersByBirthyear>({
    apiEndpoint: `${apiEndpoint}/users_by_birthyear`,
    ...streamParams,
  });
}

export const usersByGenderXlsxEndpoint = `${apiEndpoint}/users_by_gender_as_xlsx`;

export function usersByGenderStream(streamParams: IStreamParams | null = null) {
  return streams.get<IUsersByGender>({
    apiEndpoint: `${apiEndpoint}/users_by_gender`,
    ...streamParams,
  });
}

export const usersByDomicileXlsxEndpoint = `${apiEndpoint}/users_by_domicile_as_xlsx`;

export function usersByDomicileStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUsersByDomicile>({
    apiEndpoint: `${apiEndpoint}/users_by_domicile`,
    ...streamParams,
  });
}
