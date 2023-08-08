import { pick } from 'lodash-es';
import { useSearchParams } from 'react-router-dom';
import { handleArraySearchParam } from '../util';

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

  const arrayFilters = {
    tag_ids: handleArraySearchParam(searchParams, 'tag_ids'),
  };

  return {
    ...scalarFilters,
    ...arrayFilters,
  };
};

export default useAnalysisFilterParams;
