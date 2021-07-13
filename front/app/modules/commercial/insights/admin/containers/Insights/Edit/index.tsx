import React from 'react';

// styles
import styled from 'styled-components';
import { stylingConsts, media } from 'utils/styleUtils';

// components
import TopBar, { topBarHeight } from '../../../components/TopBar';
import InputsTable from './InputsTable';
import Categories from './Categories';

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

const EditInsightsView = () => {
  return (
    <div data-testid="insightsEdit">
      <TopBar />
      <Container>
        <Categories />
        <InputsTable />
      </Container>
    </div>
  );
};

export default EditInsightsView;
