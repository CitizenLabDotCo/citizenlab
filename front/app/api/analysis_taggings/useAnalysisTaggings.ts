import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import tagsKeys from './keys';
import { ITaggings, TaggingsKeys } from './types';

const fetchTaggings = (analysisId: string) => {
  return fetcher<ITaggings>({
    path: `/analyses/${analysisId}/taggings`,
    action: 'get',
    cacheIndividualItems: false,
  });
};

const useAnalysisTaggings = (analysisId: string) => {
  return useQuery<ITaggings, CLErrors, ITaggings, TaggingsKeys>({
    queryKey: tagsKeys.list({ analysisId }),
    queryFn: () => fetchTaggings(analysisId),
  });
};

export default useAnalysisTaggings;
