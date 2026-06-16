import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import surveyResponseFieldsKeys from './keys';
import {
  ISurveyResponseFields,
  ISurveyResponseFieldsParameters,
  SurveyResponseFieldsKeys,
} from './types';

const useSurveyResponseFields = ({
  phaseId,
}: ISurveyResponseFieldsParameters) =>
  useQuery<
    ISurveyResponseFields,
    CLErrors,
    ISurveyResponseFields,
    SurveyResponseFieldsKeys
  >({
    queryKey: surveyResponseFieldsKeys.list({ phaseId }),
    queryFn: () =>
      fetcher<ISurveyResponseFields>({
        path: `/phases/${phaseId}/survey_response_fields`,
        action: 'get',
      }),
    enabled: !!phaseId,
  });

export default useSurveyResponseFields;
