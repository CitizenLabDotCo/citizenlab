import React, { useState, useEffect, useCallback } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// styles
import { stylingConsts, media } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import TopBar, {
  topBarHeight,
} from 'modules/commercial/insights/admin/components/TopBar';
import Categories from './Categories';
import Network from './Network';
import Inputs from './Inputs';
import Preview from './Preview';
import Navigation from 'modules/commercial/insights/admin/components/Navigation';

// hooks
import useInsightsInputsLoadMore from 'modules/commercial/insights/hooks/useInsightsInputsLoadMore';

// types
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';

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
  width: 100%;
`;

const DetailsInsightsView = ({
  params: { viewId },
  location: { pathname, query },
}: WithRouterProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewedInputIndex, setPreviewedInputIndex] = useState<number | null>(
    null
  );

  const [movedUpDown, setMovedUpDown] = useState(false);

  const category = query.category;
  const search = query.search;

  const {
    list: inputs,
    loading,
    hasMore,
    onLoadMore,
  } = useInsightsInputsLoadMore(viewId, {
    category,
    search,
  });

  // Navigate to correct index when moving up and down
  useEffect(() => {
    if (
      !isNilOrError(inputs) &&
      !isNilOrError(previewedInputIndex) &&
      movedUpDown
    ) {
      clHistory.replace({
        pathname,
        search: stringify(
          {
            ...query,
            previewedInputId: inputs[previewedInputIndex].id,
          },
          { addQueryPrefix: true }
        ),
      });
      setMovedUpDown(false);
    }
  }, [inputs, pathname, previewedInputIndex, query, movedUpDown]);

  // Use callback to keep references for moveUp and moveDown stable
  const moveUp = useCallback(() => {
    setPreviewedInputIndex((prevSelectedIndex) =>
      !isNilOrError(prevSelectedIndex)
        ? prevSelectedIndex - 1
        : prevSelectedIndex
    );
    setMovedUpDown(true);
  }, []);

  const moveDown = useCallback(() => {
    setPreviewedInputIndex((prevSelectedIndex) =>
      !isNilOrError(prevSelectedIndex)
        ? prevSelectedIndex + 1
        : prevSelectedIndex
    );

    setMovedUpDown(true);
  }, []);

  const closePreview = () => setIsPreviewOpen(false);

  if (isNilOrError(inputs)) {
    return null;
  }

  const onPreviewInput = (input: IInsightsInputData) => {
    setPreviewedInputIndex(inputs.indexOf(input));

    clHistory.replace({
      pathname,
      search: stringify(
        { ...query, previewedInputId: input.id },
        { addQueryPrefix: true }
      ),
    });
    setIsPreviewOpen(true);
  };

  return (
    <>
      <TopBar />
      <Container data-testid="insightsDetails">
        <Left>
          {isPreviewOpen ? (
            <>
              <Preview closePreview={closePreview} />
              <Navigation
                moveUp={moveUp}
                moveDown={moveDown}
                isMoveUpDisabled={previewedInputIndex === 0}
                isMoveDownDisabled={previewedInputIndex === inputs.length - 1}
              />
            </>
          ) : (
            <Categories>
              <Network />
            </Categories>
          )}
        </Left>
        <Inputs
          hasMore={hasMore}
          inputs={inputs}
          loading={loading}
          onLoadMore={onLoadMore}
          onPreviewInput={onPreviewInput}
        />
      </Container>
    </>
  );
};

export default withRouter(DetailsInsightsView);
