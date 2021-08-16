import React from 'react';

// styles
import styled from 'styled-components';
import { stylingConsts, media } from 'utils/styleUtils';

// components
import TopBar, { topBarHeight } from '../../../components/TopBar';
import Categories from './Categories';
import Network from './Network';
import Inputs from './Inputs';

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
        <div>
          <Categories>
            <Network />
          </Categories>
        </div>
        <Inputs />
      </Container>
    </>
  );
};

export default DetailsInsightsView;
