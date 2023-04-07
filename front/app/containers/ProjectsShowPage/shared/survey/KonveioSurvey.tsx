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
  konveioSurveyUrl: string;
  className?: string;
  email: string | null;
};

const SmartSurvey = ({ konveioSurveyUrl, className, email }: Props) => {
  // Parse survey URL
  const urlSplit = konveioSurveyUrl.split('?');
  const urlParams = parse(urlSplit[1] ? urlSplit[1] : {});

  urlParams['integration'] = 'CitizenLab';
  urlParams['iframe'] = 'true';

  if (email !== null) {
    urlParams['username'] = email;
  }

  // Build URL
  const queryString = stringify(urlParams);
  const finalSurveyUrl = `${urlSplit[0]}?${queryString}`;

  return (
    <Container className={className}>
      <StyledIframe data-testid={'konveiosurvey'} src={finalSurveyUrl} />
    </Container>
  );
};

export default SmartSurvey;
