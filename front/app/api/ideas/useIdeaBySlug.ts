import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasKeys from './keys';
import { IIdea, IdeasKeys } from './types';

const fetchIdea = (slug: string) =>
  fetcher<IIdea>({ path: `/ideas/by_slug/${slug}`, action: 'get' });

const useIdeaBySlug = (slug: string) => {
  return useQuery<IIdea, CLErrors, IIdea, IdeasKeys>({
    queryKey: ideasKeys.item(slug),
    queryFn: () => fetchIdea(slug),
  });
};

export default useIdeaBySlug;
