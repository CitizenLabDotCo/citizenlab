import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useUserSurveySubmissions from 'api/user_survey_submissions/useUserSurveySubmissions';

import SurveySubmissionCard from './SurveySubmissionCard';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-grap: 20px;

  ${media.phone`
    grid-template-columns: 1fr;
  `}
`;

const Surveys = () => {
  const { data: surveySubmissions } = useUserSurveySubmissions();
  return (
    <Container>
      {surveySubmissions?.data.map((ideaMini) => (
        <SurveySubmissionCard ideaMini={ideaMini} key={ideaMini.id} />
      ))}
    </Container>
  );
};

export default Surveys;
