import React from 'react';
import styled from 'styled-components';
import ActionBarSingle from './ActionBarSingle';
import ActionBarMulti from './ActionBarMulti';

const Container = styled.div`
  display: flex;
`;

interface Props {
  ideaIds: string[];
  resetSelectedIdeas: () => void;
  handleClickEdit: () => void;
}

export default (props: Props) => {
  const { ideaIds, resetSelectedIdeas, handleClickEdit } = props;
  return (
    <Container>
      {ideaIds.length > 1 && <ActionBarMulti ideaIds={ideaIds} resetSelectedIdeas={resetSelectedIdeas} />}
      {ideaIds.length === 1 && <ActionBarSingle ideaId={ideaIds[0]} resetSelectedIdeas={resetSelectedIdeas} handleClickEdit={handleClickEdit} />}
    </Container>
  );
};
