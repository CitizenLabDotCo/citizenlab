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
  postIds: string[];
  resetSelection: () => void;
  handleClickEdit: () => void;
}

export default (props: Props) => {
  const { type, postIds, resetSelection, handleClickEdit } = props;
  return (
    <Container>
      {postIds.length > 1 && <ActionBarMulti type={type} postIds={postIds} resetSelection={resetSelection} />}
      {postIds.length === 1 && <ActionBarSingle type={type} postId={postIds[0]} resetSelection={resetSelection} handleClickEdit={handleClickEdit} />}
    </Container>
  );
};
