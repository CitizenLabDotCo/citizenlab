import { useState, useEffect } from 'react';
import { ITopicData, ITopics, topicByIdStream, topicsStream } from 'services/topics';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  topicIds?: string[];
}

export default function useTopics({ topicIds }: Props) {
  const [topics, setTopics] = useState<(ITopicData | Error)[] | undefined | null | Error>(undefined);

  useEffect(() => {
    let observable: Observable<(ITopicData | Error)[] | null> = of(null);

    if (topicIds && topicIds.length) {
      observable = combineLatest(
        topicIds.map(id => topicByIdStream(id).observable.pipe(map(topic => (!isNilOrError(topic) ? topic.data : topic))))
      );

    } else {
      observable = topicsStream().observable.pipe(map(topics => topics.data));
    }

    const subscription = observable.subscribe((topics) => {
      setTopics(topics);
    });

    return () => subscription.unsubscribe();
  }, []);

  return topics;
}
