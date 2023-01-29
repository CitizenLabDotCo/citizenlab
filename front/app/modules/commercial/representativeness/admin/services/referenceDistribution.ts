import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { apiEndpoint as statsEndpoint } from 'services/stats';
import {
  IUserCustomFieldData,
  TCustomFieldCode,
} from 'services/userCustomFields';
import { getEndpoint as getRScoreEndpoint } from './rScore';

const ENDPOINT_BY_CODE = {
  gender: `${statsEndpoint}/users_by_gender`,
  birthyear: `${statsEndpoint}/users_by_age`,
};

const getStatsEndpoint = (
  code: TCustomFieldCode | null,
  userCustomFieldId: string
): string =>
  code !== null && ENDPOINT_BY_CODE[code]
    ? ENDPOINT_BY_CODE[code]
    : `${statsEndpoint}/users_by_custom_field/${userCustomFieldId}`;

const getCustomFieldEndpoint = (userCustomFieldId: string) =>
  `${API_PATH}/users/custom_fields/${userCustomFieldId}`;

const getReferenceDistributionEndpoint = (userCustomFieldId: string) =>
  `${getCustomFieldEndpoint(userCustomFieldId)}/reference_distribution`;

export interface IReferenceDistribution {
  data: TReferenceDistributionData;
}

export type TReferenceDistributionData =
  | ICategoricalDistributionData
  | IBinnedDistributionData;

export interface ICategoricalDistributionData {
  id: string;
  type: 'categorical_distribution';
  attributes: {
    distribution: TCategoricalDistribution;
  };
  relationships: {
    values: {
      data: { id: string; type: 'custom_field_option' }[];
    };
  };
}

export interface IBinnedDistributionData {
  id: string;
  type: 'binned_distribution';
  attributes: {
    distribution: IBinnedDistribution;
  };
}

export type TCategoricalDistribution = Record<
  string,
  {
    count: number;
    probability: number;
  }
>;

export interface IBinnedDistribution {
  bins: Bins;
  counts: number[];
}

export type Bins = (number | null)[];

export type TUploadDistribution = Record<string, number> | IBinnedDistribution;

export function referenceDistributionStream(userCustomFieldId: string) {
  return streams.get<IReferenceDistribution>({
    apiEndpoint: getReferenceDistributionEndpoint(userCustomFieldId),
  });
}

export async function createReferenceDistribution(
  { id, attributes: { code } }: IUserCustomFieldData,
  distribution: TUploadDistribution
) {
  const response = await streams.add<IReferenceDistribution>(
    getReferenceDistributionEndpoint(id),
    { distribution }
  );

  await streams.fetchAllWith({
    apiEndpoint: [
      getCustomFieldEndpoint(id),
      getStatsEndpoint(code, id),
      getRScoreEndpoint(id),
      `${API_PATH}/users/custom_fields`,
    ],
  });

  return response;
}

export async function replaceReferenceDistribution(
  { id, attributes: { code } }: IUserCustomFieldData,
  distribution: TUploadDistribution
) {
  const response = await streams.add<IReferenceDistribution>(
    getReferenceDistributionEndpoint(id),
    { distribution }
  );

  await streams.fetchAllWith({
    apiEndpoint: [getStatsEndpoint(code, id), getRScoreEndpoint(id)],
  });

  return response;
}

export async function deleteReferenceDistribution({
  id,
  attributes: { code },
}: IUserCustomFieldData) {
  const response = await streams.delete(
    getReferenceDistributionEndpoint(id),
    id
  );

  await streams.fetchAllWith({
    apiEndpoint: [
      getCustomFieldEndpoint(id),
      getStatsEndpoint(code, id),
      getRScoreEndpoint(id),
      `${API_PATH}/users/custom_fields`,
    ],
  });

  return response;
}
