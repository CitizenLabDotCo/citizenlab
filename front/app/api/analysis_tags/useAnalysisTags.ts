import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import tagsKeys from './keys';
import { ITags, TagsKeys, ITagParams } from './types';

const fetchTags = ({ analysisId }: ITagParams) => {
  return fetcher<ITags>({
    path: `/analyses/${analysisId}/tags`,
    action: 'get',
  });
};

const AnalysisuseTags = (queryParams: ITagParams) => {
  return useQuery<ITags, CLErrors, ITags, TagsKeys>({
    queryKey: tagsKeys.list(queryParams),
    queryFn: () => fetchTags(queryParams),
  });
};

export default AnalysisuseTags;
