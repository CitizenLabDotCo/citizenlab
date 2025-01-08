import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useUserSurveySubmissions from 'api/user_survey_submissions/useUserSurveySubmissions';

import SurveySubmissionCard from './SurveySubmissionCard';

const Surveys = () => {
  const { data } = useUserSurveySubmissions();
  return (
    <Box>
      {data?.data.map((ideaMini) => (
        <Box display="inline" key={ideaMini.id}>
          <SurveySubmissionCard ideaMini={ideaMini} />
        </Box>
      ))}
    </Box>
  );
};

export default Surveys;
