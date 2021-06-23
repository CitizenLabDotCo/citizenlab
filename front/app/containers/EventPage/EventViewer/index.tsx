import React, { memo } from 'react';

// components
import TopBar from './TopBar';

// styling
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 60px;
`;

interface Props {
  title: string;
}

const EventViewer = memo<Props>(({ title }) => {
  return (
    <Container>
      <TopBar title={title} />
    </Container>
  );
});

export default EventViewer;
