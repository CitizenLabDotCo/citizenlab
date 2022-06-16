import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

const getReferenceDistributionEndpoint = (userCustomFieldId: string) =>
  `${API_PATH}/users/custom_fields/${userCustomFieldId}/reference_distribution`;

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

export function createReferenceDistribution(
  userCustomFieldId: string,
  distribution: TUploadDistribution
) {
  return streams.add<IReferenceDistribution>(
    getReferenceDistributionEndpoint(userCustomFieldId),
    { distribution }
  );
}

export function replaceReferenceDistribution(
  userCustomFieldId: string,
  distribution: TUploadDistribution
) {
  return streams.update<IReferenceDistribution>(
    getReferenceDistributionEndpoint(userCustomFieldId),
    userCustomFieldId,
    { distribution }
  );
}

export function deleteReferenceDistribution(userCustomFieldId: string) {
  return streams.delete(
    getReferenceDistributionEndpoint(userCustomFieldId),
    userCustomFieldId
  );
}
