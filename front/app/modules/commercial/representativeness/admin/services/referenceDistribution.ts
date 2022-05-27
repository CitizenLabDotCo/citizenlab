import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

const customFieldsEndpoint = `${API_PATH}/users/custom_fields`;

const getReferenceDistributionEndpoint = (fieldId: string) =>
  `${customFieldsEndpoint}/${fieldId}/reference_distribution`;

interface IReferenceDistributionData {
  id: string;
  type: 'reference_distribution';
  attributes: {
    distribution: {
      [key: string]: {
        count: number;
        probability: number;
      };
    };
  };
  relationships: {
    values: {
      data: {
        id: string;
        type: 'custom_field_option';
      }[];
    };
  };
}

// https://developers.citizenlab.co/api-docs/ee/frontweb_api/CL-610/representativeness-reference-distribution/representativeness_reference_distributions/get_the_reference_distribution_associated_to_a_custom_field.html
export interface IReferenceDistribution {
  /* I am making the assumption here that if no reference distribution has been uploaded yet
   * for this field, the 'data' attribute is undefined
   */
  data?: IReferenceDistributionData;
}

export function referenceDistributionStream(fieldId: string) {
  const apiEndpoint = getReferenceDistributionEndpoint(fieldId);

  return streams.get<IReferenceDistribution>({
    apiEndpoint,
  });
}
