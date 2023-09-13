import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import { useParams } from 'react-router-dom';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import useKeyPress from 'hooks/useKeyPress';
import { useSelectedInputContext } from '../SelectedInputContext';
import InputListItem from './InputListItem';
import translations from './translations';
import { useIntl } from 'utils/cl-intl';
import { useVirtualizer } from '@tanstack/react-virtual';
import Demographics from '../Demographics';
import styled from 'styled-components';

const Item = styled.div<{ start: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transform: translateY(${(props) => props.start}px);
`;

const InputsList = () => {
  const [isDemographicsOpen, setIsDemographicsOpen] = useState(false);
  const { formatMessage } = useIntl();
  const { selectedInputId, setSelectedInputId } = useSelectedInputContext();
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isSuccess } =
    useInfiniteAnalysisInputs({
      analysisId,
      queryParams: filters,
    });

  const inputs = useMemo(
    () => data && data.pages.map((page) => page.data).flat(),
    [data]
  );

  const inputsLength = inputs?.length || 1;
  const parentRef = React.useRef<HTMLDivElement | null>(null);

  const { getVirtualItems, getTotalSize, measureElement, scrollToIndex } =
    useVirtualizer({
      count: hasNextPage ? inputsLength + 1 : inputsLength,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 250,
      overscan: 5,
    });

  const virtualItems = getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= inputsLength - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    inputsLength,
    virtualItems,
  ]);

  useEffect(() => {
    isSuccess && scrollToIndex(0);
  }, [filters, scrollToIndex, isSuccess]);

  // Keyboard navigations

  const upArrow = useKeyPress('ArrowUp');
  const downArrow = useKeyPress('ArrowDown');

  useEffect(() => {
    if (upArrow) {
      setSelectedInputId((selectedInput) => {
        const selectedInputIndex =
          inputs && inputs.findIndex((input) => input.id === selectedInput);

        const previousInput =
          selectedInputIndex !== undefined && selectedInputIndex > 0 && inputs
            ? inputs[selectedInputIndex - 1]?.id
            : null;
        return previousInput;
      });
    }
  }, [upArrow, inputs, setSelectedInputId]);

  useEffect(() => {
    if (downArrow) {
      setSelectedInputId((selectedInput) => {
        const selectedInputIndex =
          inputs && inputs.findIndex((input) => input.id === selectedInput);

        const nextInput =
          inputs &&
          selectedInputIndex !== undefined &&
          selectedInputIndex < inputs.length - 1
            ? inputs[selectedInputIndex + 1]?.id
            : null;

        return nextInput;
      });
    }
  }, [downArrow, inputs, setSelectedInputId]);

  // Effect: Select first input on initialization
  useEffect(() => {
    if (!selectedInputId && data) {
      setSelectedInputId(data.pages[0]?.data[0]?.id);
    }
  }, [selectedInputId, setSelectedInputId, data]);

  const handleOnSelectInput = useCallback(
    (inputId: string) => {
      setSelectedInputId(inputId);
    },
    [setSelectedInputId]
  );

  const emptyList = data?.pages[0].meta.filtered_count === 0;
  if (!inputs) return null;

  const democraphicsOffset = isDemographicsOpen ? 210 : 60;
  return (
    <>
      <Box bg={colors.white} mb="8px">
        <Demographics
          isDemographicsOpen={isDemographicsOpen}
          setIsDemographicsOpen={setIsDemographicsOpen}
        />
      </Box>
      {emptyList ? (
        <Box display="flex" justifyContent="center">
          <Text px="24px" color="grey600">
            {formatMessage(translations.noInputs)}
          </Text>
        </Box>
      ) : (
        <Box
          bg={colors.white}
          ref={parentRef}
          overflow="auto"
          h={`calc(100vh - ${
            stylingConsts.mobileMenuHeight + democraphicsOffset
          }px)`}
          p="12px"
        >
          <Box height={`${getTotalSize()}px`} width="100%" position="relative">
            {getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > inputs.length - 1;
              const post = inputs[virtualRow.index];

              return (
                <Item
                  key={virtualRow.index}
                  start={virtualRow.start}
                  data-index={virtualRow.index}
                  ref={measureElement}
                >
                  {isLoaderRow ? (
                    <div />
                  ) : (
                    <InputListItem
                      key={virtualRow.index}
                      input={post}
                      onSelect={handleOnSelectInput}
                      selected={post.id === selectedInputId}
                    />
                  )}
                </Item>
              );
            })}
          </Box>
        </Box>
      )}
    </>
  );
};

export default InputsList;
