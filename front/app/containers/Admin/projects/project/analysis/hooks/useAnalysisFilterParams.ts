import { pick } from 'lodash-es';
import { useSearchParams } from 'react-router-dom';
import { handleArraySearchParam } from '../util';
import { useMemo } from 'react';

/** Hook that extracts and returns all filter params used in the analysis,
 * extracted from the url */
const useAnalysisFilterParams = () => {
  const [searchParams] = useSearchParams();

  const allParams = Object.fromEntries(searchParams.entries());
  const scalarFilters = pick(allParams, [
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

  const tag_ids = handleArraySearchParam(searchParams, 'tag_ids');

  const arrayFilters = {
    ...(tag_ids
      ? { tag_ids: handleArraySearchParam(searchParams, 'tag_ids') }
      : {}),
  };

  const authorCustomArrayFilters = {};
  const authorCustomScalarFilters = {};

  for (const key in allParams) {
    if (key.match(/^author_custom_([a-f0-9-]+)$/)) {
      authorCustomArrayFilters[key] = handleArraySearchParam(searchParams, key);
    } else if (key.match(/^author_custom_([a-f0-9-]+)_(from|to)$/)) {
      authorCustomScalarFilters[key] = allParams[key];
    }
  }

  // Let's make sure this hook returns a stable reference: The object stays the
  // same if the filter params don't change
  const filters = {
    ...scalarFilters,
    ...authorCustomScalarFilters,
    ...arrayFilters,
    ...authorCustomArrayFilters,
  };

  const jsonFilters = JSON.stringify(filters);
  const stableFilters = useMemo(() => {
    return JSON.parse(jsonFilters);
  }, [jsonFilters]);

  return stableFilters;
};

export default useAnalysisFilterParams;
