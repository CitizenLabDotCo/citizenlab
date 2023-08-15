import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from 'api/initiatives/keys';

const acceptInitiativeCosponsorshipInvite = ({
  initiativeId,
}: {
  initiativeId: string;
}) =>
  fetcher<{ data: [{ type: '' }] }>({
    path: `/initiatives/${initiativeId}/accept_invite`,
    action: 'patch',
  });

const useAcceptInitiativeCosponsorshipInvite = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, CLErrors, {}>({
    mutationFn: acceptInitiativeCosponsorshipInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.lists(),
      });
    },
  });
};

export default useAcceptInitiativeCosponsorshipInvite;
