import React, { memo } from 'react';

// styles
import styled from 'styled-components';
import { colors, ideaPageContentMaxWidth } from 'utils/styleUtils';

// components
import BreadCrumbs from './Breadcrumbs';
import MoreActionsMenu from './IdeaMoreActions';

const Container = styled.div`
  width: 100%;
  height: 52px;
  background-color: rgba(132, 147, 158, 0.06);
  color: ${colors.label};
`;

const Inner = styled.div`
  max-width: ${ideaPageContentMaxWidth};
  height: 100%;
  margin: 0 auto;
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Left = styled.div``;

const Right = styled.div``;

interface Props {
  ideaId: string;
}

const ActionBar = memo<Props>(({ ideaId }: Props) => {
  return (
    <Container>
      <Inner>
        <Left>
          <BreadCrumbs ideaId={ideaId} />
        </Left>
        <Right>
          <MoreActionsMenu ideaId={ideaId} />
        </Right>
      </Inner>
    </Container>
  );
});

export default ActionBar;
