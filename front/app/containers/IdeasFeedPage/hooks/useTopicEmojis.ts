import { useMemo } from 'react';

import useInputTopics from 'api/input_topics/useInputTopics';

import useLocalize from 'hooks/useLocalize';

export interface TopicData {
  emoji: string | null;
  name: string;
}

const useTopicData = (projectId: string | undefined) => {
  const { data: topicsData } = useInputTopics(projectId);
  const localize = useLocalize();

  // Create topic data lookup map with emoji and name
  const topicDataMap = useMemo(() => {
    const map = new Map<string, TopicData>();
    topicsData?.data.forEach((topic) => {
      const emoji = topic.attributes.icon || topic.attributes.parent_icon;
      const name = localize(topic.attributes.title_multiloc);
      map.set(topic.id, { emoji, name });
    });
    return map;
  }, [topicsData, localize]);

  return topicDataMap;
};

export default useTopicData;
