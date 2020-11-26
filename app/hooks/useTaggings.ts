import { useState, useEffect, useCallback } from 'react';
import { combineLatest } from 'rxjs';
import { ITagging, taggingStream } from 'services/taggings';
import { ITag, tagStream } from 'services/tags';
import { isNilOrError } from 'utils/helperUtils';
import shallowCompare from 'utils/shallowCompare';

export interface IMergedTagging extends ITagging {
  tag: ITag | undefined;
}

export default function useTaggings() {
  const [taggings, setTaggings] = useState<
    IMergedTagging[] | null | undefined | Error
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
    const tagObservable = tagStream({
      queryParameters: {
        idea_ids: ideaIds,
      },
    }).observable;

    const subscription = combineLatest(
      taggingObservable,
      tagObservable
    ).subscribe(([taggings, tags]) => {
      setTaggings(
        isNilOrError(taggings)
          ? taggings
          : isNilOrError(tags)
          ? null
          : taggings.data.map((tagging) => ({
              ...tagging,
              tag: tags?.data?.find(
                (tag) => tag.id === tagging.attributes.tag_id
              ),
            }))
      );
    });

    return () => subscription.unsubscribe();
  }, [ideaIds]);

  console.log(taggings);

  return { taggings, onIdeasChange };
}
