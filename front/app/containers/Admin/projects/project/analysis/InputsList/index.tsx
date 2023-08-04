import React from 'react';
import { Box, colors, Button } from '@citizenlab/cl2-component-library';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import { useParams } from 'react-router-dom';
import InputListItem from './InputListItem';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

interface Props {
  onSelectInput: (inputId: string) => void;
  selectedInputId: string | null;
}

const InputsList = ({ onSelectInput, selectedInputId }: Props) => {
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();

  const { data, fetchNextPage, hasNextPage } = useInfiniteAnalysisInputs({
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

  return (
    <Box bg={colors.white} w="100%" p="24px">
      <Box display="flex" justifyContent="flex-end">
        <Button
          icon="pen"
          size="s"
          mb="12px"
          buttonStyle="primary"
          onClick={handleSummaryCreate}
          disabled={isLoading}
        >
          Summarize
        </Button>
      </Box>
      {inputs?.map((input) => (
        <InputListItem
          key={input.id}
          input={input}
          onSelect={() => onSelectInput(input.id)}
          selected={input.id === selectedInputId}
        />
      ))}
      {/* Should become infinite list, temporary button */}
      {hasNextPage && <Button onClick={() => fetchNextPage()}>More</Button>}
    </Box>
  );
};

export default InputsList;
