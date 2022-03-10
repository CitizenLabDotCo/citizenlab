import { useState, useEffect } from 'react';
import { ITopicData, topicByIdStream } from 'services/topics';
import { isNilOrError } from 'utils/helperUtils';

export default function useTopic(topicId: string) {
  const [topic, setTopic] = useState<ITopicData | undefined | null | Error>();

  useEffect(() => {
    const subscription = topicByIdStream(topicId).observable.subscribe(
      (topic) => {
        isNilOrError(topic) ? setTopic(topic) : setTopic(topic.data);

        return () => subscription.unsubscribe();
      }
    );
  }, [topicId]);

  return topic;
}
