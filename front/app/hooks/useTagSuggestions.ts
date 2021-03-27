import { useState, useEffect, useCallback } from 'react';
import { ITagSuggestion, tagSuggestionsStream } from 'services/tags';

export default function useTagSuggestions(
  ideaIdsParam: string[] | null,
  projectIdsParam: string[] | null = null
) {
  const [tagSuggestions, setTagSuggestions] = useState<
    ITagSuggestion[] | null | undefined
  >(undefined);

  const [ideaIds, setIdeaIds] = useState<string[] | null | undefined>(
    ideaIdsParam
  );

  const onIdeasChange = useCallback((ideas: string[]) => {
    setIdeaIds([...ideas]);
  }, []);

  const [projectIds, setProjectIds] = useState<string[] | null>(
    projectIdsParam
  );

  const onProjectsChange = useCallback((ideas: string[]) => {
    setProjectIds([...ideas]);
  }, []);

  useEffect(() => {
    const observable = tagSuggestionsStream({
      queryParameters: {
        idea_ids: ideaIds,
        projects: projectIds,
      },
    }).observable;

    const subscription = observable.subscribe((response) => {
      setTagSuggestions(response ? response.data : response);
    });

    return () => subscription.unsubscribe();
  }, [ideaIds]);

  return { tagSuggestions, onIdeasChange, onProjectsChange };
}
