import { useState, useEffect, useCallback } from 'react';
import { ITag, tagSuggestionStream } from 'services/tags';
import useLocale from 'hooks/useLocale';

export default function useTagSuggestion() {
  const [tagSuggestion, setTagSuggestion] = useState<
    ITag[] | Error | null | undefined
  >(undefined);

  const [ideaIds, setIdeaIds] = useState<string[] | null | undefined>([]);

  const locale = useLocale();

  const onIdeasChange = useCallback((ideas: string[]) => {
    setIdeaIds([...ideas]);
  }, []);

  useEffect(() => {
    const observable = tagSuggestionStream({
      queryParameters: { idea_ids: ideaIds, locale },
    }).observable;

    const subscription = observable.subscribe((response) => {
      console.log(response);
      setTagSuggestion([...response.data]);
    });

    return () => subscription.unsubscribe();
  }, [ideaIds]);

  return { tagSuggestion, onIdeasChange };
}
