import React from 'react';

import styled from 'styled-components';

import { colors } from '@citizenlab/cl2-component-library';

const StyledIframe = styled.iframe`
  height: 600px;
  width: 100%;
  border: 1px solid ${colors.grey400};
`;

type Props = {
  snapSurveyUrl: string;
  className?: string;
};

const SnapSurvey = ({ snapSurveyUrl, className }: Props) => (
  <StyledIframe
    data-testid="snapSurveyIframe"
    className={className}
    src={snapSurveyUrl}
  />
);

export default SnapSurvey;
