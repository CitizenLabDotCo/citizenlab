import React, { useCallback } from 'react';
import { Box, colors, Button } from '@citizenlab/cl2-component-library';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import { useParams } from 'react-router-dom';
import InputListItem from './InputListItem';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import Observer from '@researchgate/react-intersection-observer';

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

  const inputs = data?.pages.map((page) => page.data).flat();

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
        <>
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
        </>
      ))}
    </Box>
  );
};

export default InputsList;
