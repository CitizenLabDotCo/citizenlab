import phasesKeys from 'api/phases/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

import questionKeys from '../keys';
import { IPollQuestionParameters } from '../types';

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
