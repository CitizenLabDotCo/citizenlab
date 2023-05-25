import React from 'react';
import { parse, stringify } from 'qs';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import useAuthUser from 'hooks/useAuthUser';

const StyledIframe = styled.iframe`
  display: block;
  height: 1000px;
  width: 100%;
`;

type Props = {
  documentUrl: string;
  className?: string;
};

const Konveio = ({ documentUrl, className }: Props) => {
  const authUser = useAuthUser();

  const email =
    !isNilOrError(authUser) && authUser.attributes.email
      ? authUser.attributes.email
      : null;

  // Parse survey URL
  const urlSplit = documentUrl.split('?');
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

export default Konveio;
