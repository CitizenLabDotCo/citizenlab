import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

const getCustomFieldEndpoint = (userCustomFieldId: string) =>
  `${API_PATH}/users/custom_fields/${userCustomFieldId}`;

const getReferenceDistributionEndpoint = (userCustomFieldId: string) =>
  `${getCustomFieldEndpoint(userCustomFieldId)}/reference_distribution`;

type TDistribution = Record<
  string,
  {
    count: number;
    probability: number;
  }
>;

export interface IReferenceDistributionData {
  id: string;
  type: 'reference_distribution';
  attributes: {
    distribution: TDistribution;
  };
  relationships: {
    values: {
      data: { id: string; type: 'custom_field_option' }[];
    };
  };
}

export interface IReferenceDistribution {
  data: IReferenceDistributionData;
}

export type TUploadDistribution = Record<string, number>;

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
    apiEndpoint: [getCustomFieldEndpoint(userCustomFieldId)],
  });

  return response;
}

export function replaceReferenceDistribution(
  userCustomFieldId: string,
  distribution: TUploadDistribution
) {
  return streams.add<IReferenceDistribution>(
    getReferenceDistributionEndpoint(userCustomFieldId),
    { distribution }
  );
}

export async function deleteReferenceDistribution(userCustomFieldId: string) {
  const response = await streams.delete(
    getReferenceDistributionEndpoint(userCustomFieldId),
    userCustomFieldId
  );

  await streams.fetchAllWith({
    apiEndpoint: [getCustomFieldEndpoint(userCustomFieldId)],
  });

  return response;
}
