import React, { useState, useEffect, useCallback, useRef } from 'react';
import { stringify } from 'qs';
// hooks
import useInsightsInputsLoadMore from 'modules/commercial/insights/hooks/useInsightsInputsLoadMore';
// types
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
// utils
import { isNilOrError } from 'utils/helperUtils';
// styles
import { stylingConsts, media } from 'utils/styleUtils';
import Navigation from 'modules/commercial/insights/admin/components/Navigation';
// components
import TopBar, {
  topBarHeight,
} from 'modules/commercial/insights/admin/components/TopBar';
import styled from 'styled-components';
import Categories from './Categories';
import Inputs from './Inputs';
import Network from './Network';
import Preview from './Preview';

const Container = styled.div`
  height: calc(100vh - ${stylingConsts.menuHeight + topBarHeight}px);
  display: flex;
  position: fixed;
  right: 0;
  top: ${stylingConsts.menuHeight + topBarHeight}px;
  left: 210px;
  bottom: 0;
  ${media.tablet`
    left: 80px;
  `}
`;

const Left = styled.div`
  position: relative;
  width: calc(100% - 420px);
`;

const DetailsInsightsView = ({
  params: { viewId },
  location: { pathname, query },
}: WithRouterProps) => {
  const [previewedInputIndex, setPreviewedInputIndex] = useState<number | null>(
    null
  );
  const [isMoveDownDisabled, setIsMoveDownDisabled] = useState(false);

  // Use ref for isPreviewedInputInList to avoid dependencies in moveUp and moveDown
  const isPreviewedInputInList = useRef(true);
  const [movedUpDown, setMovedUpDown] = useState(false);

  const categories: string[] =
    typeof query.categories === 'string'
      ? [query.categories]
      : query.categories;
  const search = query.search;
  const keywords: string[] =
    typeof query.keywords === 'string' ? [query.keywords] : query.keywords;

  const {
    list: inputs,
    loading,
    hasMore,
    onLoadMore,
  } = useInsightsInputsLoadMore(viewId, {
    categories,
    search,
    keywords,
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
          { addQueryPrefix: true, indices: false }
        ),
      });
      setMovedUpDown(false);
    }
  }, [inputs, pathname, previewedInputIndex, query, movedUpDown]);

  // Update isPreviewedInputInList ref value
  useEffect(() => {
    if (!isNilOrError(inputs)) {
      const inputsIds = inputs.map((input) => input.id);
      const isInList = inputsIds.includes(query.previewedInputId);

      isPreviewedInputInList.current = isInList;

      setIsMoveDownDisabled(
        isInList
          ? previewedInputIndex === inputs.length - 1
          : previewedInputIndex === inputs.length
      );
    }
  }, [inputs, query.previewedInputId, previewedInputIndex]);

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
      !isNilOrError(prevSelectedIndex) && isPreviewedInputInList.current
        ? prevSelectedIndex + 1
        : prevSelectedIndex
    );

    setMovedUpDown(true);
  }, []);

  const onPreviewInput = (input: IInsightsInputData) => {
    !isNilOrError(inputs) && setPreviewedInputIndex(inputs.indexOf(input));
    clHistory.replace({
      pathname,
      search: stringify(
        { ...query, previewedInputId: input.id },
        { addQueryPrefix: true, indices: false }
      ),
    });
  };

  return (
    <>
      <TopBar />
      {!isNilOrError(inputs) && (
        <Container data-testid="insightsDetails">
          <Left>
            {query.previewedInputId && (
              <>
                <Preview />
                <Navigation
                  moveUp={moveUp}
                  moveDown={moveDown}
                  isMoveUpDisabled={previewedInputIndex === 0}
                  isMoveDownDisabled={isMoveDownDisabled}
                />
              </>
            )}
            <Categories>
              <Network />
            </Categories>
          </Left>
          <Inputs
            hasMore={hasMore}
            inputs={inputs}
            loading={loading}
            onLoadMore={onLoadMore}
            onPreviewInput={onPreviewInput}
          />
        </Container>
      )}
    </>
  );
};

export default withRouter(DetailsInsightsView);
