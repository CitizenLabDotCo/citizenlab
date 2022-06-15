import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

const getReferenceDistributionEndpoint = (customFieldId: string) =>
  `${API_PATH}/users/custom_fields/${customFieldId}/reference_distribution`;

type TDistribution = Record<
  string,
  {
    count: number;
    probability: number;
  }
>;

interface IReferenceDistributionData {
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

interface IReferenceDistribution {
  data: IReferenceDistributionData;
}

type TUploadDistribution = Record<string, number>;

export function referenceDistributionStream(customFieldId: string) {
  return streams.get<IReferenceDistribution>({
    apiEndpoint: getReferenceDistributionEndpoint(customFieldId),
  });
}

export function createReferenceDistribution(
  customFieldId: string,
  distribution: TUploadDistribution
) {
  return streams.add<IReferenceDistribution>(
    getReferenceDistributionEndpoint(customFieldId),
    { distribution }
  );
}

export function replaceReferenceDistribution(
  customFieldId: string,
  distribution: TUploadDistribution
) {
  return streams.update<IReferenceDistribution>(
    getReferenceDistributionEndpoint(customFieldId),
    customFieldId,
    { distribution }
  );
}

export function deleteReferenceDistribution(customFieldId: string) {
  return streams.delete(
    getReferenceDistributionEndpoint(customFieldId),
    customFieldId
  );
}
