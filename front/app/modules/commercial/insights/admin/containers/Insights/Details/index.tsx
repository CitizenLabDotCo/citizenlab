import React from 'react';

// styles
import { stylingConsts, media } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import TopBar, { topBarHeight } from '../../../components/TopBar';
import Categories from './Categories';
import Inputs from './Inputs';
import Preview from './Preview';

const Container = styled.div`
  height: calc(100vh - ${stylingConsts.menuHeight + topBarHeight}px);
  display: flex;
  position: fixed;
  right: 0;
  top: ${stylingConsts.menuHeight + topBarHeight}px;
  left: 210px;
  bottom: 0;
  ${media.smallerThan1280px`
  left: 80px;
`}
`;

const Left = styled.div`
  position: relative;
`;

const DetailsInsightsView = () => {
  return (
    <>
      <TopBar />
      <Container>
        <Left>
          <Categories />
          <Preview />
        </Left>
        <Inputs />
      </Container>
    </>
  );
};

export default DetailsInsightsView;
