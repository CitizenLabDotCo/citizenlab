import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import surveyResultsKeys from './keys';
import { SurveyResultsKeys, IParameters, SurveyResultsType } from './types';

const getSurveyResultsEndpoint = (
  phaseId: string | null,
  filterLogicIds: string[]
) => {
  const logicIds = filterLogicIds.join(',');
  const path = `phases/${phaseId}/survey_results`;
  return path + (logicIds ? `?filter_logic_ids=${logicIds}` : '');
};

const fetchSurveyResults = ({ phaseId, filterLogicIds }: IParameters) =>
  fetcher<SurveyResultsType>({
    path: `/${getSurveyResultsEndpoint(phaseId, filterLogicIds)}`,
    action: 'get',
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
