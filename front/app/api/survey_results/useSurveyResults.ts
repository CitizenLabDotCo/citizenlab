import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import surveyResultsKeys from './keys';
import { SurveyResultsKeys, IParameters, SurveyResultsType } from './types';

const getSurveyResultsEndpoint = (phaseId: string | null) => {
  return `phases/${phaseId}/survey_results`;
};

const fetchSurveyResults = ({ phaseId }: IParameters) =>
  fetcher<SurveyResultsType>({
    path: `/${getSurveyResultsEndpoint(phaseId)}`,
    action: 'get',
  });

const useSurveyResults = ({ phaseId }: IParameters) => {
  return useQuery<
    SurveyResultsType,
    CLErrors,
    SurveyResultsType,
    SurveyResultsKeys
  >({
    queryKey: surveyResultsKeys.item({ phaseId }),
    queryFn: () => fetchSurveyResults({ phaseId }),
  });
};

export default useSurveyResults;
