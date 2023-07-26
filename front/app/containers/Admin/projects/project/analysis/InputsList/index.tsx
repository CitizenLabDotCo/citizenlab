import React from 'react';
import { Box, colors } from '@citizenlab/cl2-component-library';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import { useSearchParams, useParams } from 'react-router-dom';
import T from 'components/T';
import Button from 'components/UI/Button';
import { pick } from 'lodash-es';
const InputsList = () => {
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

  const { data, fetchNextPage, hasNextPage } = useInfiniteAnalysisInputs({
    analysisId,
    queryParams: filters,
  });

  const inputs = data?.pages.map((page) => page.data).flat();

  return (
    <Box bg={colors.white} w="100%" p="24px">
      {inputs?.map((input) => (
        <div key={input.id}>
          <T value={input.attributes.title_multiloc} />
        </div>
      ))}
      {hasNextPage && <Button onClick={() => fetchNextPage()}>More</Button>}
    </Box>
  );
};

export default InputsList;
