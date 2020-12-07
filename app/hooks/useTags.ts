import { useState, useEffect, useCallback } from 'react';
import { ITag, tagsStream } from 'services/tags';
import { isNilOrError } from 'utils/helperUtils';

export interface IUseTag {
  tags: ITag[] | null | undefined;
  onIdeasChange: (ideas: string[]) => void;
  onSearchChange: (search: string) => void;
}

export default function useTags(ideaIdsParam = [] as string[]) {
  const [tags, setTags] = useState<ITag[] | null | undefined>(undefined);

  const [ideaIds, setIdeaIds] = useState<string[] | null | undefined>(
    ideaIdsParam || []
  );

  const onIdeasChange = useCallback((ideas: string[]) => {
    setIdeaIds([...ideas]);
  }, []);

  const [search, setSearch] = useState<string | null | undefined>();

  const onSearchChange = useCallback((search: string) => {
    setSearch(search);
  }, []);

  useEffect(() => {
    const observable = tagsStream({
      queryParameters: {
        search,
        idea_ids: ideaIds,
      },
    }).observable;

    const subscription = observable.subscribe((response) => {
      setTags(!isNilOrError(response) ? response.data : null);
    });

    return () => subscription.unsubscribe();
  }, [ideaIds, search]);

  return { tags, onIdeasChange, onSearchChange };
}
