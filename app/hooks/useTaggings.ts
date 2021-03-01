import { useState, useEffect, useCallback } from 'react';
import { ITagging, taggingStream } from 'services/taggings';
import { isNilOrError } from 'utils/helperUtils';

export default function useTaggings() {
  const [taggings, setTaggings] = useState<
    ITagging[] | null | undefined | Error
  >(undefined);

  const [ideaIds, setIdeaIds] = useState<string[] | null | undefined>([]);

  const onIdeasChange = useCallback((ideas: string[]) => {
    setIdeaIds([...ideas]);
  }, []);

  useEffect(() => {
    const taggingObservable = taggingStream({
      queryParameters: {
        idea_ids: ideaIds,
      },
    }).observable;

    const subscriptions = [
      taggingObservable.subscribe((taggings) => {
        setTaggings(isNilOrError(taggings) ? taggings : taggings.data);
      }),
    ];

    return () => subscriptions.forEach((sub) => sub.unsubscribe());
  }, [ideaIds]);

  return { taggings, onIdeasChange };
}
