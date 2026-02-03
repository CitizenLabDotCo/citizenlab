import { useMemo } from 'react';

import useInputTopics from 'api/input_topics/useInputTopics';

const useTopicEmojis = (projectId: string | undefined) => {
  const { data: topicsData } = useInputTopics(projectId);

  // Create emoji lookup map from topics, using parent_icon as fallback for subtopics
  const topicEmojis = useMemo(() => {
    const map = new Map<string, string | null>();
    topicsData?.data.forEach((topic) => {
      const emoji = topic.attributes.icon || topic.attributes.parent_icon;
      map.set(topic.id, emoji);
    });
    return map;
  }, [topicsData]);

  return topicEmojis;
};

export default useTopicEmojis;
