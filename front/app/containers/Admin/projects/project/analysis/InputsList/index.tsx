import React from 'react';
import { Box, colors } from '@citizenlab/cl2-component-library';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import { useSearchParams, useParams } from 'react-router-dom';
import Button from 'components/UI/Button';
import { pick } from 'lodash-es';
import InputListItem from './InputListItem';
import { handleArraySearchParam } from '../util';

interface Props {
  onSelectInput: (inputId: string) => void;
  selectedInputId: string | null;
}

const InputsList = ({ onSelectInput, selectedInputId }: Props) => {
  const { analysisId } = useParams() as { analysisId: string };
  const [searchParams] = useSearchParams();

  const allParams = Object.fromEntries(searchParams.entries());
  const filters = pick(allParams, [
    'search',
    'published_at_from',
    'published_at_to',
    'reactions_from',
    'reactions_to',
    'votes_from',
    'votes_to',
    'comments_from',
    'comments_to',
  ]);

  const selectedTags = handleArraySearchParam(searchParams, 'tag_ids');

  const { data, fetchNextPage, hasNextPage } = useInfiniteAnalysisInputs({
    analysisId,
    queryParams: { ...filters, tag_ids: selectedTags },
  });

  const inputs = data?.pages.map((page) => page.data).flat();

  return (
    <Box bg={colors.white} w="100%" p="24px">
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
