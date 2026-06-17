import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import surveyResponseFieldsKeys from './keys';
import {
  ISurveyResponseFields,
  ISurveyResponseFieldsParameters,
  SurveyResponseFieldsKeys,
} from './types';

// Returns the list of fields that will be exported for a given phase, and includes a flag
// for whether the field is considered personal data (pre-selected for redaction).
//
// Used specifically for the PDF export of survey responses feature.
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
