import { useState, useEffect, useCallback } from 'react';
import { ITag, tagStream } from 'services/tags';

export interface IUseTag {
  tags: ITag[] | null | Error | undefined;
  onIdeasChange: (ideas: string[]) => void;
  onSearchChange: (search: string) => void;
}

export default function useTags() {
  const [tags, setTags] = useState<ITag[] | null | undefined>(undefined);

  const [ideaIds, setIdeaIds] = useState<string[] | null | undefined>([]);

  const onIdeasChange = useCallback((ideas: string[]) => {
    setIdeaIds([...ideas]);
  }, []);

  const [search, setSearch] = useState<string | null | undefined>();

  const onSearchChange = useCallback((search: string) => {
    setSearch(search);
  }, []);

  useEffect(() => {
    const observable = tagStream({
      queryParameters: {
        search,
        idea_ids: ideaIds,
      },
    }).observable;

    const subscription = observable.subscribe((response) => {
      setTags(response ? response.data : response);
    });

    return () => subscription.unsubscribe();
  }, [ideaIds, search]);

  return { tags, onIdeasChange, onSearchChange };
}
