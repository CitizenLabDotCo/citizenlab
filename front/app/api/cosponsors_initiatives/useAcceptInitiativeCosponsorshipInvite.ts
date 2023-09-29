import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from 'api/initiatives/keys';
import { IInitiative } from 'api/initiatives/types';

const acceptInitiativeCosponsorshipInvite = (initiativeId: string) => {
  return fetcher<IInitiative>({
    path: `/initiatives/${initiativeId}/accept_cosponsorship_invite`,
    action: 'patch',
  });
};

const useAcceptInitiativeCosponsorshipInvite = () => {
  const queryClient = useQueryClient();
  return useMutation<IInitiative, CLErrors, string>({
    mutationFn: acceptInitiativeCosponsorshipInvite,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.item({
          id: data.data.id,
        }),
      });
    },
  });
};

export default useAcceptInitiativeCosponsorshipInvite;
