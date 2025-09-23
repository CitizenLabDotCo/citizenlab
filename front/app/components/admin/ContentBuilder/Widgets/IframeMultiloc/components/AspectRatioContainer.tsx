import React from 'react';

import styled from 'styled-components';

interface Props {
  aspectRatioPercentage: number;
  children: React.ReactNode;
}

const Container = styled.div<{ aspectRatioPercentage: number }>`
  overflow: hidden;
  padding-bottom: ${({ aspectRatioPercentage }) => aspectRatioPercentage}%;
  position: relative;
  height: 0;

  iframe {
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    position: absolute;
  }
`;

const AspectRatioContainer: React.FC<Props> = ({
  aspectRatioPercentage,
  children,
}) => {
  return (
    <Container aspectRatioPercentage={aspectRatioPercentage}>
      {children}
    </Container>
  );
};

export default AspectRatioContainer;
