import { useState, useEffect, useCallback } from 'react';
import { ITag, tagsStream } from 'services/tags';
import { isNilOrError } from 'utils/helperUtils';

export interface IUseTag {
  tags: ITag[] | null | undefined;
  onIdeasChange: (ideas: string[]) => void;
  onSearchChange: (search: string) => void;
}

export default function useTags(
  ideaIdsParam = null as string[] | null,
  projectIdsParam = null as string[] | null
) {
  const [tags, setTags] = useState<ITag[] | null | undefined>(undefined);

  const [ideaIds, setIdeaIds] = useState<string[] | null>(ideaIdsParam);
  const [projectIds, setProjectIds] = useState<string[] | null>(
    projectIdsParam
  );

  const onIdeasChange = useCallback((ideas: string[]) => {
    setIdeaIds([...ideas]);
  }, []);

  const onProjectsChange = useCallback((projects: string[]) => {
    setProjectIds([...projects]);
  }, []);

  const [search, setSearch] = useState<string | null>();

  const onSearchChange = useCallback((search: string) => {
    setSearch(search);
  }, []);

  useEffect(() => {
    const observable = tagsStream({
      queryParameters: {
        search,
        ...(ideaIds?.length && ideaIds?.length > 0
          ? { idea_ids: ideaIds }
          : {}),
        ...(projectIds?.length && projectIds?.length > 0
          ? { projects: projectIds }
          : {}),
      },
    }).observable;

    const subscription = observable.subscribe((response) => {
      setTags(!isNilOrError(response) ? response.data : null);
    });

    return () => subscription.unsubscribe();
  }, [ideaIds, search, projectIds]);

  return { tags, onIdeasChange, onProjectsChange, onSearchChange };
}
