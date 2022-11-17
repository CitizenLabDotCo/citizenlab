import { useState, useEffect } from 'react';
import {
  ITopicData,
  topicByIdStream,
  topicsStream,
  Code,
  ITopicsQueryParams,
} from 'services/topics';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNilOrError, NilOrError, reduceErrors } from 'utils/helperUtils';

export interface Parameters {
  /** Don't use the ids and the query parameters (code, exclude_code, sort) together.
   *  Only one of the two at a time.
   */
  topicIds?: string[];
  code?: Code;
  excludeCode?: Code;
  sort?: 'new' | 'custom';
  forHomepageFilter?: boolean;
  includeStaticPages?: boolean;
}

export default function useTopics(parameters: Parameters = {}) {
  const {
    topicIds,
    code,
    excludeCode,
    sort,
    forHomepageFilter,
    includeStaticPages,
  } = parameters;
  const [topics, setTopics] = useState<ITopicData[] | NilOrError>(undefined);

  const topicIdsStringified = JSON.stringify(topicIds);

  const queryParameters: ITopicsQueryParams = {
    code,
    exclude_code: excludeCode,
    sort,
    for_homepage_filter: forHomepageFilter,
    ...(includeStaticPages && {
      include_static_pages: true,
    }),
  };

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
