import { useState, useEffect } from 'react';
import { projectTopicsStream } from 'services/projectTopics';
import {
  ITopicData,
  topicByIdStream,
  topicsStream,
  Code,
} from 'services/topics';
import { Observable, of, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';

interface Parameters {
  projectId?: string;
  topicIds?: string[];
  code?: Code;
  exclude_code?: Code;
  sort?: 'new' | 'custom';
}

export default function useTopics(parameters: Parameters) {
  const { projectId, topicIds, code, exclude_code, sort } = parameters;
  const [topics, setTopics] = useState<
    (ITopicData | Error)[] | undefined | null | Error
  >(undefined);
  const queryParameters = { code, exclude_code, sort };

  useEffect(() => {
    let observable: Observable<(ITopicData | Error)[] | null> = of(null);

    if (projectId) {
      observable = projectTopicsStream(projectId).observable.pipe(
        map((topics) =>
          topics.data
            .filter((topic) => topic)
            .map((topic) => topic.relationships.topic.data.id)
        ),
        switchMap((topicIds) => {
          return combineLatest(
            topicIds.map((topicId) =>
              topicByIdStream(topicId).observable.pipe(
                map((topic) => (!isNilOrError(topic) ? topic.data : topic))
              )
            )
          );
        })
      );
    } else if (topicIds) {
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

    const subscription = observable.subscribe((topics) => {
      setTopics(topics);
    });

    return () => subscription.unsubscribe();
  }, [topicIds]);

  return topics;
}
