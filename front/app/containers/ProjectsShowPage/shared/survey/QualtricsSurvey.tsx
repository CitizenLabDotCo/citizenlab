import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledIframe = styled.iframe`
  display: block;
  border: none;
  height: 600px;
  flex-basis: 640px;
  border: 1px solid #ccc;
`;

type Props = {
  qualtricsUrl: string;
  className?: string;
};

const QualtricsSurvey = ({ qualtricsUrl, className }: Props) => {
  return (
    <Container className={className}>
      <StyledIframe src={qualtricsUrl} />
    </Container>
  );
};

export default QualtricsSurvey;
