import { API_PATH } from 'containers/App/constants';
import { Multiloc } from 'typings';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/stats`;

interface ISeries {
  users: {
    [key: string]: number;
  };
  reference_population: null | {
    [key: string]: number;
  };
  expected_users: null | {
    [key: string]: number;
  };
}

export type TOptions = Record<
  string,
  { title_multiloc: Multiloc, ordering: number }
>

export interface IUsersByDomicile {
  series: {
    users: {
      [key: string]: number;
    };
    // TODO replace by ISeries when implemented
  };
  areas: TOptions;
}

export interface IUsersByBirthyear {
  series: ISeries;
}

export interface IUsersByRegistrationField {
  series: ISeries;
  options: TOptions;
}

export type TStreamResponse = 
  | IUsersByBirthyear
  // | IUsersByDomicile
  | IUsersByRegistrationField;

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
  return streams.get<IUsersByRegistrationField>({
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
