import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import userCustomFieldsKeys from 'api/user_custom_fields/keys';
import usersByBirthyearKeys from 'api/users_by_birthyear/keys';
import usersByGenderKeys from 'api/users_by_gender/keys';
import usersByCustomFieldKeys from 'api/users_by_custom_field/keys';
import referenceDistributionKeys from './keys';
import rScoreKeys from '../r_score/keys';

const deleteReferenceDistribution = (id: string) =>
  fetcher({
    path: `/users/custom_fields/${id}/reference_distribution`,
    action: 'delete',
  });

const useDeleteReferenceDistribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReferenceDistribution,
    onSuccess: (_data, id) => {
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

      queryClient.invalidateQueries({
        queryKey: referenceDistributionKeys.item({ id }),
      });
    },
  });
};

export default useDeleteReferenceDistribution;
