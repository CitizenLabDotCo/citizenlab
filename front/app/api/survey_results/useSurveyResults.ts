import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import surveyResultsKeys from './keys';
import { SurveyResultsKeys, IParameters, SurveyResultsType } from './types';

const getSurveyResultsEndpoint = (phaseId: string | null) => {
  return `phases/${phaseId}/survey_results`;
};

const fetchSurveyResults = ({ phaseId, filterLogicIds }: IParameters) =>
  fetcher<SurveyResultsType>({
    path: `/${getSurveyResultsEndpoint(phaseId)}`,
    action: 'get',
    queryParams:
      filterLogicIds.length > 0 ? { filter_logic_ids: filterLogicIds } : {},
  });

const useSurveyResults = ({ phaseId, filterLogicIds }: IParameters) => {
  return useQuery<
    SurveyResultsType,
    CLErrors,
    SurveyResultsType,
    SurveyResultsKeys
  >({
    queryKey: surveyResultsKeys.item({ phaseId, filterLogicIds }),
    queryFn: () => fetchSurveyResults({ phaseId, filterLogicIds }),
  });
};

export default useSurveyResults;
