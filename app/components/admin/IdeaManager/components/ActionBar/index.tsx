import React from 'react';
import styled from 'styled-components';
import ActionBarSingle from './ActionBarSingle';
import ActionBarMulti from './ActionBarMulti';

const Container = styled.div`
  display: flex;
`;

export default (props: { ideaIds: string[] }) => {
  const { ideaIds } = props;
  return (
    <Container>
      {ideaIds.length > 1 && <ActionBarMulti ideaIds={ideaIds} />}
      {ideaIds.length === 1 && <ActionBarSingle ideaId={ideaIds[0]} />}
    </Container>
  );
};
