import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasKeys from './keys';
import { IIdea, IdeasKeys } from './types';

export const fetchIdea = ({ slug }: { slug?: string | null }) =>
  fetcher<IIdea>({ path: `/ideas/by_slug/${slug}`, action: 'get' });

const useIdeaBySlug = (slug: string | null | undefined) => {
  return useQuery<IIdea, CLErrors, IIdea, IdeasKeys>({
    queryKey: ideasKeys.item({ slug: slug ?? undefined }),
    queryFn: () => fetchIdea({ slug }),
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });
};

export default useIdeaBySlug;
