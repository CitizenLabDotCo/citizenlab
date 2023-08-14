import React, { Fragment, useCallback, useEffect, useMemo } from 'react';
import { Box, colors, Button } from '@citizenlab/cl2-component-library';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import { useParams } from 'react-router-dom';
import InputListItem from './InputListItem';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import Observer from '@researchgate/react-intersection-observer';
import useKeyPress from 'hooks/useKeyPress';

interface Props {
  onSelectInput: (inputId: string) => void;
  selectedInputId: string | null;
}

const InputsList = ({ onSelectInput, selectedInputId }: Props) => {
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteAnalysisInputs({
      analysisId,
      queryParams: filters,
    });
  const { mutate: addsummary, isLoading } = useAddAnalysisSummary();

  const inputs = useMemo(
    () => data?.pages.map((page) => page.data).flat(),
    [data]
  );

  const handleSummaryCreate = () => {
    addsummary({
      analysisId,
      filters,
    });
  };

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
    if (inputs && upArrow && selectedInputId) {
      const selectedInputIndex = inputs.findIndex(
        (input) => input.id === selectedInputId
      );

      const previousInput =
        selectedInputIndex !== 0 ? inputs[selectedInputIndex - 1]?.id : 0;

      if (previousInput) {
        onSelectInput(previousInput);
      }
    }
  }, [upArrow, selectedInputId, inputs, onSelectInput]);

  useEffect(() => {
    if (inputs && downArrow && selectedInputId) {
      const selectedInputIndex = inputs.findIndex(
        (input) => input.id === selectedInputId
      );

      const nextInput =
        selectedInputIndex !== inputs.length - 1
          ? inputs[selectedInputIndex + 1]?.id
          : 0;

      if (nextInput) {
        onSelectInput(nextInput);
      }
    }
  }, [downArrow, selectedInputId, inputs, onSelectInput]);

  return (
    <Box bg={colors.white} w="100%">
      <Box display="flex" justifyContent="flex-end">
        <Button
          icon="flash"
          mb="12px"
          size="s"
          w="100%"
          buttonStyle="secondary-outlined"
          onClick={handleSummaryCreate}
          disabled={isLoading}
        >
          Auto-summarize {inputs?.length} inputs
        </Button>
      </Box>

      {data?.pages.map((page, i) => (
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
              onSelect={() => onSelectInput(input.id)}
              selected={input.id === selectedInputId}
            />
          ))}
        </Fragment>
      ))}
    </Box>
  );
};

export default InputsList;
