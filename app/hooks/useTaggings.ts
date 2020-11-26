import { useState, useEffect, useCallback } from 'react';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
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
    const observable = taggingStream({
      queryParameters: {
        idea_ids: ideaIds,
      },
    }).observable;

    const subscription = observable
      .pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        switchMap((taggings) =>
          tagStream({
            queryParameters: {
              idea_ids: ideaIds,
            },
          }).observable.pipe(
            map((tags) => ({
              taggings,
              tags,
            }))
          )
        )
      )
      .subscribe(({ taggings, tags }) => {
        console.log(tags, taggings);
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
