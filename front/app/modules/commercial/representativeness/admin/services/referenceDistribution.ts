import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { apiEndpoint as statsEndpoint } from 'services/stats';

const getStatsEndpoints = (userCustomFieldId: string) => [
  `${statsEndpoint}/users_by_gender`,
  // `${statsEndpoint}/users_by_domicile`
  `${statsEndpoint}/users_by_birthyear`,
  `${statsEndpoint}/users_by_custom_field/${userCustomFieldId}`,
];

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
  userCustomFieldId: string,
  distribution: TUploadDistribution
) {
  const response = await streams.add<IReferenceDistribution>(
    getReferenceDistributionEndpoint(userCustomFieldId),
    { distribution }
  );

  await streams.fetchAllWith({
    apiEndpoint: [
      getCustomFieldEndpoint(userCustomFieldId),
      ...getStatsEndpoints(userCustomFieldId),
      `${API_PATH}/users/custom_fields`,
    ],
  });

  return response;
}

export async function replaceReferenceDistribution(
  userCustomFieldId: string,
  distribution: TUploadDistribution
) {
  const response = await streams.add<IReferenceDistribution>(
    getReferenceDistributionEndpoint(userCustomFieldId),
    { distribution }
  );

  await streams.fetchAllWith({
    apiEndpoint: getStatsEndpoints(userCustomFieldId),
  });

  return response;
}

export async function deleteReferenceDistribution(userCustomFieldId: string) {
  const response = await streams.delete(
    getReferenceDistributionEndpoint(userCustomFieldId),
    userCustomFieldId
  );

  await streams.fetchAllWith({
    apiEndpoint: [
      getCustomFieldEndpoint(userCustomFieldId),
      ...getStatsEndpoints(userCustomFieldId),
      `${API_PATH}/users/custom_fields`,
    ],
  });

  return response;
}
