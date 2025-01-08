import React from 'react';

import useUserSurveySubmissions from 'api/user_survey_submissions/useUserSurveySubmissions';

const Surveys = () => {
  const { data } = useUserSurveySubmissions();
  console.log(data);
  return <>Test</>;
};

export default Surveys;
