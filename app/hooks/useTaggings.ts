import { useState, useEffect, useCallback } from 'react';
import { ITagging, taggingStream } from 'services/taggings';

export default function useTaggings() {
  const [taggings, setTaggings] = useState<ITagging[] | null | undefined>(
    undefined
  );

  const [ideaIds, setIdeaIds] = useState<string[] | null | undefined>([]);

  const onIdeasChange = useCallback((ideas: string[]) => {
    setIdeaIds([...ideas]);
  }, []);

  useEffect(() => {
    const observable = taggingStream({
      queryParameters: {
        idea_ids: ideaIds,
      },
    }).observable;

    const subscription = observable.subscribe((response) => {
      setTaggings(response ? response.data : response);
    });

    return () => subscription.unsubscribe();
  }, [ideaIds]);

  return { taggings, onIdeasChange };
}
