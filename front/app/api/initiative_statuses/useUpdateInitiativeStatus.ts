import { useMutation, useQueryClient } from '@tanstack/react-query';
import initiativesKeys from 'api/initiatives/keys';
import { IInitiative } from 'api/initiatives/types';
import initiativeFilterCountsKeys from 'api/initiatives_filter_counts/keys';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { InitiativeStatusUpdate } from './types';
import initiativesAllowedTransitionsKeys from 'api/initiative_allowed_transitions/keys';
import initiativeOfficialFeedbackKeys from 'api/initiative_official_feedback/keys';

const updateInitiativeStatus = ({
  initiativeId,
  ...requestBody
}: InitiativeStatusUpdate) =>
  fetcher<IInitiative>({
    path: `/initiatives/${initiativeId}/initiative_status_changes`,
    action: 'post',
    body: { initiative_status_change: { ...requestBody } },
  });

const useUpdateInitiativeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<IInitiative, CLErrors, InitiativeStatusUpdate>({
    mutationFn: updateInitiativeStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries(initiativesKeys.lists());
      queryClient.invalidateQueries(initiativesKeys.item({ id: data.data.id }));
      queryClient.invalidateQueries(initiativeFilterCountsKeys.items());
      queryClient.invalidateQueries(
        initiativesAllowedTransitionsKeys.item({ id: data.data.id })
      );
      queryClient.invalidateQueries(
        initiativeOfficialFeedbackKeys.list({ initiativeId: data.data.id })
      );
    },
  });
};

export default useUpdateInitiativeStatus;
