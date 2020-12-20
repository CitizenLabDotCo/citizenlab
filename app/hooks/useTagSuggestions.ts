import { useState, useEffect, useCallback } from 'react';
import { ITagSuggestion, tagSuggestionsStream } from 'services/tags';

export default function useTagSuggestions(ideaIdsParam: string[]) {
  const [tagSuggestions, setTagSuggestions] = useState<
    ITagSuggestion[] | null | undefined
  >(undefined);

  const [ideaIds, setIdeaIds] = useState<string[] | null | undefined>(
    ideaIdsParam
  );

  const onIdeasChange = useCallback((ideas: string[]) => {
    setIdeaIds([...ideas]);
  }, []);

  useEffect(() => {
    const observable = tagSuggestionsStream({
      queryParameters: {
        idea_ids: ideaIds,
      },
    }).observable;

    const subscription = observable.subscribe((response) => {
      setTagSuggestions(response ? response.data : response);
    });

    return () => subscription.unsubscribe();
  }, [ideaIds]);

  return { tagSuggestions, onIdeasChange };
}
