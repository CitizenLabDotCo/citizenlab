import React from 'react';
import { parse, stringify } from 'qs';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const StyledIframe = styled.iframe`
  display: block;
  height: 1000px;
  width: 100%;
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
    <Box display="flex" justifyContent="center" className={className}>
      <StyledIframe
        data-testid={'konveiosurvey'}
        src={finalSurveyUrl}
        frameBorder={0}
        allowFullScreen
      />
    </Box>
  );
};

export default SmartSurvey;
