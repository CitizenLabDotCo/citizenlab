import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useUserSurveySubmissions from 'api/user_survey_submissions/useUserSurveySubmissions';

import SurveySubmissionCard from './SurveySubmissionCard';

const Surveys = () => {
  const { data } = useUserSurveySubmissions();
  return (
    <Box>
      {data?.data.map((idea) => (
        <Box display="inline" key={idea.id}>
          <SurveySubmissionCard idea={idea} />
        </Box>
      ))}
    </Box>
  );
};

export default Surveys;
