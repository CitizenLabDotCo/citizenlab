import React from 'react';
import styled from 'styled-components';

const StyledIframe = styled.iframe`
  height: 600px;
  width: 100%;
  border: 1px solid #ccc;
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
