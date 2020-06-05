import { useState, useEffect } from 'react';
import { ITopicData, topicByIdStream, topicsStream, Code } from 'services/topics';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';

interface Parameters {
  topicIds?: string[];
  code?: Code;
  exclude_code?: Code;
}

export default function useTopics(parameters: Parameters) {
  const {
    topicIds,
    code,
    exclude_code,
  } = parameters;
  const [topics, setTopics] = useState<(ITopicData | Error)[] | undefined | null | Error>(undefined);
  const queryParameters = { code, exclude_code };

  useEffect(() => {
    let observable: Observable<(ITopicData | Error)[] | null> = of(null);

    if (topicIds && topicIds.length) {
      observable = combineLatest(
        topicIds.map(id => topicByIdStream(id).observable.pipe(map(topic => (!isNilOrError(topic) ? topic.data : topic))))
      );

    } else {
      observable = topicsStream({ queryParameters }).observable.pipe(map(topics => topics.data));
    }

    const subscription = observable.subscribe((topics) => {
      setTopics(topics);
    });

    return () => subscription.unsubscribe();
  }, []);

  return topics;
}
