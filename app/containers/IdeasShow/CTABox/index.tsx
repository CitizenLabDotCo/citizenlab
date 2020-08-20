import React from 'react';
import styled from 'styled-components';
import Voting from './Voting';

const Container = styled.div`
  background-color: #e6ebec; // TODO: add color to component library
  border-radius: 2px;
  padding: 25px 15px;
`;

interface Props {
  ideaId: string;
  projectId: string;
}

const CTABox = ({ ideaId, projectId }: Props) => {
  return (
    <Container>
      <Voting ideaId={ideaId} projectId={projectId} />
    </Container>
  );
}

export default CTABox;
