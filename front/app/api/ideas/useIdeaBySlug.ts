import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasKeys from './keys';
import { IIdea, IdeasKeys } from './types';

export const fetchIdea = ({ slug }: { slug: string }) =>
  fetcher<IIdea>({ path: `/ideas/by_slug/${slug}`, action: 'get' });

const useIdeaBySlug = (slug: string | null | undefined) => {
  return useQuery<IIdea, CLErrors, IIdea, IdeasKeys>({
    queryKey: slug ? ideasKeys.item({ slug }) : undefined,
    queryFn: slug ? () => fetchIdea({ slug }) : undefined,
    refetchOnWindowFocus: false,
  });
};

export default useIdeaBySlug;
