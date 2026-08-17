import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import queryOptions from 'utils/cl-react-query/queryOptions';

import ideasKeys from './keys';
import { IIdea, IdeasKeys } from './types';

export const fetchIdea = ({ slug }: { slug: string }) =>
  fetcher<IIdea>({ path: `/ideas/by_slug/${slug}`, action: 'get' });

export const ideaBySlugOptions = (slug: string) =>
  queryOptions<IIdea, IdeasKeys>({
    queryKey: ideasKeys.item({ slug }),
    queryFn: () => fetchIdea({ slug }),
  });

const useIdeaBySlug = (slug: string | null | undefined) => {
  const options = slug ? ideaBySlugOptions(slug) : undefined;

  return useQuery<IIdea, CLErrors, IIdea, IdeasKeys>({
    queryKey: options?.queryKey,
    queryFn: options?.queryFn,
    refetchOnWindowFocus: false,
  });
};

export default useIdeaBySlug;
