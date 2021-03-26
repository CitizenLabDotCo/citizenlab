import React from 'react';
import styled from 'styled-components';
import ActionBarSingle from './ActionBarSingle';
import ActionBarMulti from './ActionBarMulti';
import { ManagerType } from '../..';

const Container = styled.div`
  display: flex;
`;

interface Props {
  type: ManagerType;
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  resetSelection: () => void;
  handleClickEdit: () => void;
}

export default (props: Props) => {
  const { type, selection, resetSelection, handleClickEdit } = props;
  return (
    <Container>
      {selection.size > 1 && (
        <ActionBarMulti
          type={type}
          selection={selection}
          resetSelection={resetSelection}
        />
      )}
      {selection.size === 1 && (
        <ActionBarSingle
          type={type}
          postId={[...selection][0]}
          resetSelection={resetSelection}
          handleClickEdit={handleClickEdit}
        />
      )}
    </Container>
  );
};
