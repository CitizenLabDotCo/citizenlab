import React from 'react';

// styles
import styled from 'styled-components';
import { stylingConsts, media } from 'utils/styleUtils';

import TopBar, { topBarHeight } from '../../../components/TopBar';
import Categories from './Categories';
import Network from './Network';

const Container = styled.div`
  height: calc(100vh - ${stylingConsts.menuHeight + topBarHeight}px);
  display: flex;
  flex-direction: column;
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
        <Categories>
          <Network />
        </Categories>
      </Container>
    </>
  );
};

export default DetailsInsightsView;
