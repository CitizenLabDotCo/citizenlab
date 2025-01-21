import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import userSurveySubmissionsKeys from './keys';
import { Response, UserSurveySubmissionsKeys } from './types';

const fetchUserSurveySubmissions = async () => {
  return fetcher<Response>({
    path: '/ideas/survey_submissions',
    action: 'get',
  });
};

const useUserSurveySubmissions = () => {
  return useQuery<Response, CLErrors, Response, UserSurveySubmissionsKeys>({
    queryKey: userSurveySubmissionsKeys.list({}),
    queryFn: () => fetchUserSurveySubmissions(),
  });
};

export default useUserSurveySubmissions;
