import { API_PATH } from 'containers/App/constants';
import { Multiloc } from 'typings';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/stats`;

// Parameters
export interface ICustomFieldParams extends IStreamParams {
  queryParameters?: {
    start_at?: string | null;
    end_at?: string | null;
    group?: string;
    project?: string;
  };
}

// Response types
export interface IUsersByRegistrationField {
  series: {
    users: {
      [key: string]: number;
    };
    reference_population: {
      [key: string]: number;
    };
    expected_users: {
      [key: string]: number;
    };
  };
  options: {
    [key: string]: {
      title_multiloc: Multiloc;
      ordering: number;
    };
  };
}

export interface IUsersByDomicile {
  series: {
    users: {
      [key: string]: number;
    };
    // reference_population: {
    //   [key: string]: number;
    // }
    // expected_users: {
    //   [key: string]: number;
    // };
  };
  areas: {
    [key: string]: {
      title_multiloc: Multiloc;
      ordering: number;
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

export interface IUsersByAge {
  total_user_count: number;
  unknown_age_count: number;
  series: {
    user_counts: number[];
    expected_user_counts: number[];
    reference_population: number[];
    bins: (number | null)[];
  };
}

export const usersByRegFieldXlsxEndpoint = (customFieldId: string) =>
  `${apiEndpoint}/users_by_custom_field_as_xlsx/${customFieldId}`;

export function usersByRegFieldStream(
  streamParams: ICustomFieldParams | null = null,
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
  streamParams: ICustomFieldParams | null = null
) {
  return streams.get<IUsersByBirthyear>({
    apiEndpoint: `${apiEndpoint}/users_by_birthyear`,
    ...streamParams,
  });
}

export const usersByGenderXlsxEndpoint = `${apiEndpoint}/users_by_gender_as_xlsx`;

export function usersByGenderStream(
  streamParams: ICustomFieldParams | null = null
) {
  return streams.get<IUsersByRegistrationField>({
    apiEndpoint: `${apiEndpoint}/users_by_gender`,
    ...streamParams,
  });
}

export const usersByDomicileXlsxEndpoint = `${apiEndpoint}/users_by_domicile_as_xlsx`;

export function usersByDomicileStream(
  streamParams: ICustomFieldParams | null = null
) {
  return streams.get<IUsersByDomicile>({
    apiEndpoint: `${apiEndpoint}/users_by_domicile`,
    ...streamParams,
  });
}

export function usersByAgeStream(
  streamParams: ICustomFieldParams | null = null
) {
  return streams.get<IUsersByAge>({
    apiEndpoint: `${apiEndpoint}/users_by_age`,
    ...streamParams,
  });
}

export const usersByAgeXlsxEndpoint = `${apiEndpoint}/users_by_age_as_xlsx`;
