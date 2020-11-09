import { useState, useEffect, useCallback } from 'react';
import {
  ITag,
  tagAssignmentsSuggestionStream,
  tagSuggestionsStream,
} from 'services/tags';
import useLocale from 'hooks/useLocale';

export interface IAutoTag extends ITag {
  idea_ids: string[];
}

export default function useTagSuggestion() {
  const [tagSuggestion, setTagSuggestion] = useState<
    IAutoTag[] | null | undefined
  >(undefined);

  const [ideaIds, setIdeaIds] = useState<string[] | null | undefined>([]);

  const locale = useLocale();

  const onIdeasChange = useCallback((ideas: string[]) => {
    setIdeaIds([...ideas]);
  }, []);

  useEffect(() => {
    const observable = tagSuggestionsStream({
      queryParameters: {
        locale,
        idea_ids: ideaIds,
      },
    }).observable;

    const subscription = observable.subscribe((response) => {
      tagAssignmentsSuggestionStream({
        queryParameters: {
          locale,
          idea_ids: ideaIds,
          tag_ids: response.data.map((tag) => tag.id),
        },
      }).observable.subscribe((assignments) => {
        setTagSuggestion(
          response.data.map((tag) => ({
            ...tag,
            idea_ids: assignments.data
              .filter((assignment) => assignment.attributes.tag_id === tag.id)
              .map((assignment) => assignment.attributes.idea_id),
          }))
        );
      });
    });

    return () => subscription.unsubscribe();
  }, [ideaIds]);

  return { tagSuggestion, onIdeasChange };
}
