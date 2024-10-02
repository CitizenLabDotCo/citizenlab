import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import cosponsorshipKeys from './keys';
import { ICosponsorship } from './types';

type IAcceptCosponsorshipInvitationObject = {
  ideaId: string;
  id: string;
};

const acceptCosponsorshipInvitation = ({
  ideaId,
  id,
}: IAcceptCosponsorshipInvitationObject) =>
  fetcher<ICosponsorship>({
    path: `/ideas/${ideaId}/cosponsorships/${id}/accept`,
    action: 'patch',
  });

const useAcceptCosponsorshipInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ICosponsorship,
    CLErrors,
    IAcceptCosponsorshipInvitationObject
  >({
    mutationFn: acceptCosponsorshipInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cosponsorshipKeys.lists() });
    },
  });
};

export default useAcceptCosponsorshipInvitation;
