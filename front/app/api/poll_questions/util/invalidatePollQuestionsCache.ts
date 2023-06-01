import { queryClient } from 'utils/cl-react-query/queryClient';
import { IPollQuestionParameters } from '../types';
import projectsKeys from 'api/projects/keys';
import questionKeys from '../keys';
import phasesKeys from 'api/phases/keys';

const invalidatePollQuestionsCache = (variables: IPollQuestionParameters) => {
  queryClient.invalidateQueries({
    queryKey: questionKeys.list({
      participationContextId: variables.participationContextId,
      participationContextType: variables.participationContextType,
    }),
  });
  if (variables.participationContextType === 'project') {
    queryClient.invalidateQueries({
      queryKey: projectsKeys.item({ id: variables.participationContextId }),
    });
  } else if (variables.participationContextType === 'phase') {
    queryClient.invalidateQueries({
      queryKey: phasesKeys.item({
        phaseId: variables.participationContextId,
      }),
    });
  }
};

export default invalidatePollQuestionsCache;
