import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useUserSurveySubmissions from 'api/user_survey_submissions/useUserSurveySubmissions';
import useUserById from 'api/users/useUserById';

import Unauthorized from 'components/Unauthorized';

import SurveySubmissionCard from './SurveySubmissionCard';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;

  ${media.phone`
    grid-template-columns: 1fr;
  `}
`;

const Surveys = () => {
  const { data: authUser } = useAuthUser();

  const { userId } = useParams();
  const { data: user } = useUserById(userId);

  const { data: surveySubmissions } = useUserSurveySubmissions();

  if (!authUser) {
    return <Unauthorized />;
  }

  if (!user || user.data.id !== authUser.data.id) {
    return null;
  }

  return (
    <Container>
      {surveySubmissions?.data.map((ideaMini) => (
        <SurveySubmissionCard ideaMini={ideaMini} key={ideaMini.id} />
      ))}
    </Container>
  );
};

export default Surveys;
