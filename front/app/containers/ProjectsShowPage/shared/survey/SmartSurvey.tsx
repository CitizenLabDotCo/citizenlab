import React from 'react';
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
};

const SmartSurvey = ({ smartSurveyUrl, className }: Props) => {
  return (
    <Container className={className}>
      <StyledIframe src={smartSurveyUrl} />
    </Container>
  );
};

export default SmartSurvey;
