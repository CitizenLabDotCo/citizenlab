import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';

const acceptInitiativeCosponsorshipInvite = ({
  initiativeId,
}: {
  initiativeId: string;
}) =>
  fetcher<{ data: [{ type: '' }] }>({
    path: `/cosponsors_initiatives/${initiativeId}/accept_invite`,
    action: 'patch',
  });

const useAcceptInitiativeCosponsorshipInvite = () => {
  // const queryClient = useQueryClient();
  return useMutation<{}, CLErrors, {}>({
    mutationFn: acceptInitiativeCosponsorshipInvite,
    onSuccess: () => {},
  });
};

export default useAcceptInitiativeCosponsorshipInvite;
