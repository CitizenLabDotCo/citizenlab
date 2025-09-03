import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import surveyResultsKeys from './keys';
import { SurveyResultsKeys, IParameters, SurveyResultsType } from './types';

const getSurveyResultsEndpoint = (phaseId: string | null) => {
  return `phases/${phaseId}/survey_results`;
};

const fetchSurveyResults = ({
  phaseId,
  filterLogicIds,
  quarter,
  year,
}: IParameters) =>
  fetcher<SurveyResultsType>({
    path: `/${getSurveyResultsEndpoint(phaseId)}`,
    action: 'get',
    queryParams: {
      filter_logic_ids: filterLogicIds.length > 0 ? filterLogicIds : [],
      quarter,
      year,
    },
  });

const useSurveyResults = ({
  phaseId,
  filterLogicIds,
  quarter,
  year,
}: IParameters) => {
  return useQuery<
    SurveyResultsType,
    CLErrors,
    SurveyResultsType,
    SurveyResultsKeys
  >({
    queryKey: surveyResultsKeys.item({
      phaseId,
      filterLogicIds,
      quarter,
      year,
    }),
    queryFn: () =>
      fetchSurveyResults({ phaseId, filterLogicIds, quarter, year }),
  });
};

export default useSurveyResults;
