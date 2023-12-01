import { queryClient } from 'utils/cl-react-query/queryClient';
import { IPollQuestionParameters } from '../types';
import questionKeys from '../keys';
import phasesKeys from 'api/phases/keys';

const invalidatePollQuestionsCache = (variables: IPollQuestionParameters) => {
  queryClient.invalidateQueries({
    queryKey: questionKeys.list({
      phaseId: variables.phaseId,
    }),
  });
  queryClient.invalidateQueries({
    queryKey: phasesKeys.item({
      phaseId: variables.phaseId,
    }),
  });
};

export default invalidatePollQuestionsCache;
