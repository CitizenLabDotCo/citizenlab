import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IReferenceDistribution, TAddDistribution } from './types';
import userCustomFieldsKeys from 'api/user_custom_fields/keys';
import usersByBirthyearKeys from 'api/users_by_birthyear/keys';
import usersByGenderKeys from 'api/users_by_gender/keys';
import usersByCustomFieldKeys from 'api/users_by_custom_field/keys';
import rScoreKeys from '../r_score/keys';
import referenceDistributionKeys from './keys';

const addReferenceDistribution = async ({
  id,
  ...distribution
}: TAddDistribution) =>
  fetcher<IReferenceDistribution>({
    path: `/users/custom_fields/${id}/reference_distribution`,
    action: 'post',
    body: { distribution },
  });

const useAddReferenceDistribution = () => {
  const queryClient = useQueryClient();
  return useMutation<IReferenceDistribution, CLErrors, TAddDistribution>({
    mutationFn: addReferenceDistribution,
    onSuccess: (_data, variables) => {
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
        queryKey: rScoreKeys.item({ id: variables.id }),
      });

      queryClient.invalidateQueries({
        queryKey: referenceDistributionKeys.item({
          id: variables.id,
        }),
      });
    },
  });
};

export default useAddReferenceDistribution;
