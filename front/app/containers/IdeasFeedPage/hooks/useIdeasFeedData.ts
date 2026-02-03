import { useMemo } from 'react';

import { uniqBy } from 'lodash-es';

import useInfiniteIdeaFeedIdeas from 'api/idea_feed/useInfiniteIdeaFeedIdeas';
import useIdeaById from 'api/ideas/useIdeaById';

interface UseIdeasFeedDataParams {
  phaseId: string;
  topicId?: string | null;
  initialIdeaId?: string;
}

const useIdeasFeedData = ({
  phaseId,
  topicId,
  initialIdeaId,
}: UseIdeasFeedDataParams) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteIdeaFeedIdeas({
      phaseId,
      topic: topicId || undefined,
      'page[size]': 10,
      keepPreviousData: topicId ? false : true,
    });

  const flatIdeas = useMemo(() => {
    if (!data) return [];
    const allIdeas = data.pages.flatMap((page) => page.data);
    return uniqBy(allIdeas, 'id');
  }, [data]);

  // Check if initial idea is already in the list
  const initialIdeaInList = useMemo(() => {
    if (!initialIdeaId) return true;
    return flatIdeas.some((idea) => idea.id === initialIdeaId);
  }, [flatIdeas, initialIdeaId]);

  // Fetch the initial idea separately if it's not in the list
  const { data: initialIdeaData } = useIdeaById(
    initialIdeaInList ? undefined : initialIdeaId
  );

  // Reorder ideas to put the initial idea first (if provided), otherwise keep original order
  const orderedIdeas = useMemo(() => {
    // If we need to fetch the initial idea and it's loaded, prepend it
    // But only if no topic filter is active, or the idea has the selected topic
    if (initialIdeaId && !initialIdeaInList && initialIdeaData) {
      const initialIdeaTopics =
        initialIdeaData.data.relationships.input_topics?.data.map(
          (topic) => topic.id
        ) || [];
      const initialIdeaHasSelectedTopic =
        !topicId || initialIdeaTopics.includes(topicId);

      if (initialIdeaHasSelectedTopic) {
        return [initialIdeaData.data, ...flatIdeas];
      }
      // If the initial idea doesn't have the selected topic, don't add it
      return flatIdeas;
    }

    if (flatIdeas.length === 0 || !initialIdeaId) return flatIdeas;

    const initialIndex = flatIdeas.findIndex(
      (idea) => idea.id === initialIdeaId
    );
    if (initialIndex === -1) return flatIdeas;

    const initialIdea = flatIdeas[initialIndex];
    const otherIdeas = [
      ...flatIdeas.slice(0, initialIndex),
      ...flatIdeas.slice(initialIndex + 1),
    ];

    return [initialIdea, ...otherIdeas];
  }, [flatIdeas, initialIdeaId, initialIdeaInList, initialIdeaData, topicId]);

  // Extract topic IDs for each idea
  const ideaTopics = useMemo(() => {
    const map = new Map<string, string[]>();
    orderedIdeas.forEach((idea) => {
      const topicIds =
        idea.relationships.input_topics?.data.map((topic) => topic.id) || [];
      map.set(idea.id, topicIds);
    });
    return map;
  }, [orderedIdeas]);

  return {
    orderedIdeas,
    ideaTopics,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
};

export default useIdeasFeedData;
