import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import { queryClient } from 'utils/cl-react-query/queryClient';
import userCustomFieldsKeys from 'api/user_custom_fields/keys';
import usersByBirthyearKeys from 'api/users_by_birthyear/keys';
import usersByGenderKeys from 'api/users_by_gender/keys';
import usersByCustomFieldKeys from 'api/users_by_custom_field/keys';
import rScoreKeys from '../api/r_score/keys';

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

export async function createReferenceDistribution(
  { id }: IUserCustomFieldData,
  distribution: TUploadDistribution
) {
  const response = await streams.add<IReferenceDistribution>(
    getReferenceDistributionEndpoint(id),
    { distribution }
  );

  queryClient.invalidateQueries({
    queryKey: userCustomFieldsKeys.lists(),
  });

  queryClient.invalidateQueries({
    queryKey: usersByBirthyearKeys.all(),
  });

  queryClient.invalidateQueries({
    queryKey: usersByGenderKeys.all(),
  });

  queryClient.invalidateQueries({
    queryKey: usersByCustomFieldKeys.all(),
  });

  queryClient.invalidateQueries({
    queryKey: rScoreKeys.item({ id }),
  });

  return response;
}

export async function deleteReferenceDistribution({
  id,
}: IUserCustomFieldData) {
  const response = await streams.delete(
    getReferenceDistributionEndpoint(id),
    id
  );

  queryClient.invalidateQueries({
    queryKey: userCustomFieldsKeys.lists(),
  });

  queryClient.invalidateQueries({
    queryKey: usersByBirthyearKeys.all(),
  });

  queryClient.invalidateQueries({
    queryKey: usersByGenderKeys.all(),
  });

  queryClient.invalidateQueries({
    queryKey: usersByCustomFieldKeys.all(),
  });

  queryClient.invalidateQueries({
    queryKey: rScoreKeys.item({ id }),
  });

  return response;
}
