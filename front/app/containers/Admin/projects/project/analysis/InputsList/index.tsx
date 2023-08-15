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
  onSelectInput: React.Dispatch<React.SetStateAction<string | null>>;
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
    () => data && data.pages.map((page) => page.data).flat(),
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
    if (upArrow) {
      onSelectInput((selectedInput) => {
        const selectedInputIndex =
          inputs && inputs.findIndex((input) => input.id === selectedInput);

        const previousInput =
          selectedInputIndex !== undefined && selectedInputIndex > 0 && inputs
            ? inputs[selectedInputIndex - 1]?.id
            : null;
        return previousInput;
      });
    }
  }, [upArrow, inputs, onSelectInput]);

  useEffect(() => {
    if (downArrow) {
      onSelectInput((selectedInput) => {
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
  }, [downArrow, inputs, onSelectInput]);

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
