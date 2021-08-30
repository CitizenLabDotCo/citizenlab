import React from 'react';

import { stylingConsts, media } from 'utils/styleUtils';

// components
import TopBar, { topBarHeight } from '../../../components/TopBar';
import Categories from './Categories';
import Inputs from './Inputs';
import styled from 'styled-components';

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

const DetailsInsightsView = () => {
  return (
    <>
      <TopBar />
      <Container>
        <Categories />
        <Inputs />
      </Container>
    </>
  );
};

export default DetailsInsightsView;
