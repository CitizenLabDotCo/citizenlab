import React from 'react';
import { stringify } from 'qs';
import { omitBy, isNil } from 'lodash-es';

import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledIframe = styled.iframe`
  display: block;
  height: 600px;
  flex-basis: 640px;
  border: 1px solid #ccc;
`;

type Props = {
  smartSurveyUrl: string;
  className?: string;
  email: string | null;
  user_id: string | null;
};

const SmartSurvey = ({ smartSurveyUrl, className, email, user_id }: Props) => {
  const queryString = stringify(omitBy({ email, user_id }, isNil));
  const finalSurveyUrl = `${smartSurveyUrl}?${queryString}`;

  return (
    <Container className={className}>
      <StyledIframe src={finalSurveyUrl} />
    </Container>
  );
};

export default SmartSurvey;
