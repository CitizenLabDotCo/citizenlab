import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';

// styles
import { stylingConsts, media } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import TopBar, {
  topBarHeight,
} from 'modules/commercial/insights/admin/components/TopBar';
import Categories from './Categories';
import Inputs from './Inputs';
import Preview from './Preview';

// hooks
import useInsightsInputsLoadMore from 'modules/commercial/insights/hooks/useInsightsInputsLoadMore';

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

const DetailsInsightsView = ({
  params: { viewId },
  location: { query },
}: WithRouterProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const category = query.category;
  const search = query.search;
  const pageNumber = query.pageNumber ? Number(query.pageNumber) : 1;

  const inputs = useInsightsInputsLoadMore(viewId, {
    category,
    search,
    pageNumber,
  });

  if (isNilOrError(inputs.list)) {
    return null;
  }

  const openPreview = () => setIsPreviewOpen(true);
  const closePreview = () => setIsPreviewOpen(false);
  return (
    <>
      <TopBar />
      <Container>
        <Left>
          <Categories />
          <Preview isPreviewOpen={isPreviewOpen} closePreview={closePreview} />
        </Left>
        <Inputs inputs={inputs} openPreview={openPreview} />
      </Container>
    </>
  );
};

export default withRouter(DetailsInsightsView);
