import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import surveyResultsKeys from './keys';
import { SurveyResultsKeys, IParameters, SurveyResultsType } from './types';

const getSurveyResultsEndpoint = (
  phaseId: string | null,
  filterLogicOptionIds: string[]
) => {
  const optionIds = filterLogicOptionIds.join(',');
  const path = `phases/${phaseId}/survey_results`;
  return path + (optionIds ? `?filter_logic_option_ids=${optionIds}` : '');
};

const fetchSurveyResults = ({ phaseId, filterLogicOptionIds }: IParameters) =>
  fetcher<SurveyResultsType>({
    path: `/${getSurveyResultsEndpoint(phaseId, filterLogicOptionIds)}`,
    action: 'get',
  });

const useSurveyResults = ({ phaseId, filterLogicOptionIds }: IParameters) => {
  return useQuery<
    SurveyResultsType,
    CLErrors,
    SurveyResultsType,
    SurveyResultsKeys
  >({
    queryKey: surveyResultsKeys.item({ phaseId, filterLogicOptionIds }),
    queryFn: () => fetchSurveyResults({ phaseId, filterLogicOptionIds }),
  });
};

export default useSurveyResults;
