import { useState, useEffect } from 'react';
import {
  ITopicData,
  topicByIdStream,
  topicsStream,
  Code,
} from 'services/topics';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNilOrError, NilOrError, reduceErrors } from 'utils/helperUtils';

interface Parameters {
  topicIds?: string[];
  code?: Code;
  exclude_code?: Code;
  sort?: 'new' | 'custom';
}

export default function useTopics(parameters: Parameters) {
  const { topicIds, code, exclude_code, sort } = parameters;
  const [topics, setTopics] = useState<ITopicData[] | NilOrError>(undefined);
  const queryParameters = { code, exclude_code, sort };

  const topicIdsStringified = JSON.stringify(topicIds);
  const queryParametersStringified = JSON.stringify(queryParameters);

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
  }, [topicIdsStringified, queryParametersStringified]);

  return topics;
}
