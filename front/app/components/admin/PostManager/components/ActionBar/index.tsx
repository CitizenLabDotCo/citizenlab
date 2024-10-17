import React from 'react';

import styled from 'styled-components';

import ActionBarMulti from './ActionBarMulti';
import ActionBarSingle from './ActionBarSingle';

const Container = styled.div`
  display: flex;
`;

interface Props {
  /** A set of ids of ideas that are currently selected */
  selection: Set<string>;
  resetSelection: () => void;
  handleClickEdit: () => void;
}

export default (props: Props) => {
  const { selection, resetSelection, handleClickEdit } = props;
  const postId = [...selection][0];
  return (
    <Container>
      {selection.size > 1 && (
        <ActionBarMulti selection={selection} resetSelection={resetSelection} />
      )}
      {selection.size === 1 && postId && (
        <ActionBarSingle
          postId={postId}
          resetSelection={resetSelection}
          handleClickEdit={handleClickEdit}
        />
      )}
    </Container>
  );
};
