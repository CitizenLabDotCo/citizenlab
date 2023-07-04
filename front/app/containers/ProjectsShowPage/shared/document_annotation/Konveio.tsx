import React from 'react';
import { parse, stringify } from 'qs';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import useAuthUser from 'api/me/useAuthUser';

const StyledIframe = styled.iframe`
  display: block;
  height: 1000px;
  width: 100%;
  border: none;
`;

type Props = {
  documentUrl: string;
  className?: string;
};

const Konveio = ({ documentUrl, className }: Props) => {
  // We want to always render this component, no conditionals.
  // Permissions are managed at a higher level.
  const { data: authUser } = useAuthUser();
  const email = authUser?.data.attributes.email;

  // Parse survey URL
  const urlSplit = documentUrl.split('?');
  const urlParams = parse(urlSplit[1] ? urlSplit[1] : {});

  urlParams['integration'] = 'CitizenLab';
  urlParams['iframe'] = 'true';

  if (typeof email === 'string') {
    urlParams['cemail'] = email;
  }

  // Build URL
  const queryString = stringify(urlParams);
  const finalSurveyUrl = `${urlSplit[0]}?${queryString}`;

  return (
    <Box display="flex" justifyContent="center" className={className}>
      <StyledIframe
        data-testid={'konveiosurvey'}
        src={finalSurveyUrl}
        allow="fullscreen"
      />
    </Box>
  );
};

export default Konveio;
