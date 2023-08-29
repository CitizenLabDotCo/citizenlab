import React, { Fragment, useCallback, useEffect, useMemo } from 'react';
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import { useParams } from 'react-router-dom';
import InputListItem from './InputListItem';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import Observer from '@researchgate/react-intersection-observer';
import useKeyPress from 'hooks/useKeyPress';
import { useSelectedInputContext } from '../SelectedInputContext';
import translations from './translations';
import { useIntl } from 'utils/cl-intl';

const InputsList = () => {
  const { formatMessage } = useIntl();
  const { selectedInputId, setSelectedInputId } = useSelectedInputContext();
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteAnalysisInputs({
      analysisId,
      queryParams: filters,
    });

  const inputs = useMemo(
    () => data && data.pages.map((page) => page.data).flat(),
    [data]
  );

  const handleIntersection = useCallback(
    (event: IntersectionObserverEntry, unobserve: () => void) => {
      if (event.isIntersecting && hasNextPage) {
        fetchNextPage();
        unobserve();
      }
    },
    [fetchNextPage, hasNextPage]
  );

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

  const handleOnSelectInput = useCallback(
    (inputId: string) => {
      setSelectedInputId(inputId);
    },
    [setSelectedInputId]
  );

  const emptyList = data?.pages[0].meta.filtered_count === 0;

  return (
    <Box bg={colors.white} w="100%">
      {emptyList && (
        <Box display="flex" justifyContent="center">
          <Text px="24px" color="grey600">
            {formatMessage(translations.noInputs)}
          </Text>
        </Box>
      )}
      {!emptyList &&
        data?.pages.map((page, i) => (
          <Fragment key={i}>
            {hasNextPage &&
              !isFetchingNextPage &&
              data?.pages.length === i + 1 && (
                <Observer onChange={handleIntersection} rootMargin="100px">
                  <Box w="100%" />
                </Observer>
              )}
            {page.data.map((input) => (
              <InputListItem
                key={input.id}
                input={input}
                onSelect={handleOnSelectInput}
                selected={input.id === selectedInputId}
              />
            ))}
          </Fragment>
        ))}
    </Box>
  );
};

export default InputsList;
