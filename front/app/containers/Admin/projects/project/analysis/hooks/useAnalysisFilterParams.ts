import { useSearchParams } from 'react-router-dom';
import { handleArraySearchParam } from '../util';
import { useMemo } from 'react';
import { IInputsFilterParams } from 'api/analysis_inputs/types';

const STATIC_SCALAR_FILTERS = [
  'search',
  'published_at_from',
  'published_at_to',
  'reactions_from',
  'reactions_to',
  'votes_from',
  'votes_to',
  'comments_from',
  'comments_to',
];

const STATIC_ARRAY_FILTERS = ['tag_ids'];

/** Hook that extracts and returns all filter params used in the analysis,
 * extracted from the url */
const useAnalysisFilterParams = () => {
  const [searchParams] = useSearchParams();

  const allParams = Object.fromEntries(searchParams.entries());

  const filters = Object.entries(allParams).reduce(
    (accumulator, [key, value]) => {
      if (
        key.match(/^(author|input)_custom_([a-f0-9-]+)$/) ||
        STATIC_ARRAY_FILTERS.includes(key)
      ) {
        accumulator[key] = handleArraySearchParam(searchParams, key);
      } else if (
        key.match(/^(author|input)_custom_([a-f0-9-]+)_(from|to)$/) ||
        STATIC_SCALAR_FILTERS.includes(key)
      ) {
        accumulator[key] = value;
      }
      return accumulator;
    },
    {}
  );

  // Let's make sure this hook returns a stable reference: The object stays the
  // same if the filter params don't change
  const jsonFilters = JSON.stringify(filters);
  const stableFilters = useMemo(() => {
    return JSON.parse(jsonFilters);
  }, [jsonFilters]);

  return stableFilters as IInputsFilterParams;
};

export default useAnalysisFilterParams;
