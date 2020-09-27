import React, { memo } from 'react';

// components
import ContentContainer from 'components/ContentContainer';

// styling
import styled from 'styled-components';

const Container = styled.div``;

const Line = styled.div`
  width: 100%;
  height: 1px;
  border-top: solid 1px #ccc;
`;

interface Props {
  className?: string;
}

const Separotor = memo<Props>(({ className }) => {
  return (
    <Container className={className || ''}>
      <ContentContainer>
        <Line />
      </ContentContainer>
    </Container>
  );
});

export default Separotor;
