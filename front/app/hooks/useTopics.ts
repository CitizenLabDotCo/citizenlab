import { useState, useEffect } from 'react';
import {
  ITopicData,
  topicByIdStream,
  topicsStream,
  ITopicsQueryParams,
} from 'services/topics';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNilOrError, NilOrError, reduceErrors } from 'utils/helperUtils';

export interface Parameters extends ITopicsQueryParams {
  // Don't use the ids and the query parameters (code, exclude_code, sort) together
  // Only one of the two at a time.
  topicIds?: string[];
}

export default function useTopics(parameters: Parameters) {
  const { topicIds, ...queryParameters } = parameters;
  const [topics, setTopics] = useState<ITopicData[] | NilOrError>(undefined);

  useEffect(() => {
    let observable: Observable<(ITopicData | Error)[] | null> = of(null);

    if (topicIds) {
      if (topicIds.length > 0) {
        observable = combineLatest(
          topicIds.map((id) =>
            topicByIdStream(id).observable.pipe(
              map((topic) => (!isNilOrError(topic) ? topic.data : topic))
            )
          )
        );
      }
    } else {
      observable = topicsStream({ queryParameters }).observable.pipe(
        map((topics) => topics.data)
      );
    }

    const subscription = observable.subscribe(
      reduceErrors<ITopicData>(setTopics)
    );

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicIds]);

  return topics;
}
