import React, { useCallback, useEffect, useMemo, Fragment } from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import { useParams } from 'react-router-dom';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import useKeyPress from 'hooks/useKeyPress';
import { useSelectedInputContext } from '../SelectedInputContext';
import Observer from '@researchgate/react-intersection-observer';
import InputListItem from './InputListItem';
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

  const handleIntersection = useCallback(
    (event: IntersectionObserverEntry, unobserve: () => void) => {
      if (event.isIntersecting && hasNextPage) {
        fetchNextPage();
        unobserve();
      }
    },
    [fetchNextPage, hasNextPage]
  );

  const inputs = useMemo(
    () => data && data.pages.map((page) => page.data).flat(),
    [data]
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

  return (
    <>
      {emptyList ? (
        <Box display="flex" justifyContent="center">
          <Text px="24px" color="grey600">
            {formatMessage(translations.noInputs)}
          </Text>
        </Box>
      ) : (
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
        ))
      )}
    </>
  );
};

export default InputsList;
