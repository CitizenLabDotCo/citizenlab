import React from 'react';
import styled from 'styled-components';
import Voting from './Voting';
import Buttons from '../Buttons';

const Container = styled.div`
  background-color: #edeff0; // TODO: add color to component library
  border-radius: 2px;
  padding: 25px 15px;
`;

const StyledVoting = styled(Voting)`
  margin-bottom: 30px;
`;

interface Props {
  className?: string;
  ideaId: string;
  projectId: string;
}

const CTABox = ({ className, ideaId, projectId }: Props) => {
  // TODO: a11y title
  return (
    <Container className={className}>
      <StyledVoting ideaId={ideaId} projectId={projectId} />
      <Buttons ideaId={ideaId} />
    </Container>
  );
};

export default CTABox;
