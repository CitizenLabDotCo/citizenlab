import React, { memo } from 'react';

// styles
import styled from 'styled-components';
import { colors, media, ideaPageContentWidths } from 'utils/styleUtils';

// components
import BreadCrumbs from './Breadcrumbs';

const Container = styled.div`
  width: 100%;
  height: 52px;
  background-color:rgba(132, 147, 158, 0.06);
  color: ${colors.label};
`;

const Content = styled.div`
  max-width: ${ideaPageContentWidths.default};
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.smallerThan1200px`
    max-width: ${ideaPageContentWidths.smallerThan1200px};
  `}

  ${media.smallerThan1100px`
    max-width: ${ideaPageContentWidths.smallerThan1100px};
  `}
`;

const Left = styled.div``;

const Right = styled.div``;

interface Props {}

const ActionBar = memo<Props>((_props: Props) => {
  return (
    <Container>
      <Content>
        <Left>
          <BreadCrumbs />
        </Left>
        <Right>
          {ideaPageContentWidths.default}
        </Right>
      </Content>
    </Container>
  );
});

export default ActionBar;
