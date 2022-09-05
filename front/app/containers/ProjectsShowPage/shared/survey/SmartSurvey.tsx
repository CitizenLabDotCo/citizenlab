import React from 'react';
import { parse, stringify } from 'qs';

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
  // Parse survey URL
  const urlSplit = smartSurveyUrl.split('?');
  const urlParams = parse(urlSplit[1] ? urlSplit[1] : {});

  if (email !== null) {
    urlParams['email'] = email;
  }

  if (user_id !== null) {
    urlParams['user_id'] = user_id;
  }

  // Build URL
  const queryString = stringify(urlParams);
  const finalSurveyUrl = `${urlSplit[0]}?${queryString}`;

  return (
    <Container className={className}>
      <StyledIframe data-testid={'smartsurvey'} src={finalSurveyUrl} />
    </Container>
  );
};

export default SmartSurvey;
