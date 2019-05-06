import React, { memo } from 'react';

// styles
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

// components
import BreadCrumbs from './Breadcrumbs';

import { maxPageWidths } from '../index';

const Container = styled.div`
  width: 100%;
  height: 52px;
  background-color:rgba(132, 147, 158, 0.06);
  color: ${colors.label};
`;

const Content = styled.div`
  max-width: 1150px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.smallerThan1200px`
    max-width: 1050px;
  `}

  ${media.smallerThan1100px`
    max-width: 950px;
  `}
`;

const Left = styled.div`
`;

const Right = styled.div`
`;

interface Props {}

const ActionBar = (props: Props) => {
  return (
    <Container>
      <Content>
        <Left>
          <BreadCrumbs />
        </Left>
        <Right>
          {maxPageWidths.fullWidth}
        </Right>
      </Content>
    </Container>
  );
};

export default ActionBar;
