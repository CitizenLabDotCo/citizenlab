import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import surveyResultsKeys from './keys';
import { SurveyResultsKeys, IParameters, SurveyResultsType } from './types';

const getSurveyResultsEndpoint = (
  projectId: string,
  phaseId?: string | null
) => {
  return phaseId
    ? `phases/${phaseId}/survey_results`
    : `projects/${projectId}/survey_results`;
};

const fetchSurveyResults = ({ projectId, phaseId }: IParameters) =>
  fetcher<SurveyResultsType>({
    path: `/${getSurveyResultsEndpoint(projectId, phaseId)}`,
    action: 'get',
  });

const useSurveyResults = ({ projectId, phaseId }: IParameters) => {
  return useQuery<
    SurveyResultsType,
    CLErrors,
    SurveyResultsType,
    SurveyResultsKeys
  >({
    queryKey: surveyResultsKeys.item({ projectId, phaseId }),
    queryFn: () => fetchSurveyResults({ projectId, phaseId }),
  });
};

export default useSurveyResults;
