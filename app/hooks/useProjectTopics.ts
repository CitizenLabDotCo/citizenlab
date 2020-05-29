import { useState, useEffect } from 'react';
import { ITopicData, topicByIdStream, topicsStream, ITopics } from 'services/topics';
import { projectTopicsStream } from 'services/projects';

import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';

interface Parameters {
  projectId: string;
  code?: string;
  exclude_code?: string;
  sort?: 'custom' | 'new';
}

export default function useProjectTopics({
  projectId,
  code,
  exclude_code,
  sort
}: Parameters) {
  const [projectTopics, setProjectTopics] = useState<ITopicData[] | undefined | null | Error>(undefined);

  useEffect(() => {
    let observable: Observable<ITopicData[]| null> = of(null);

    observable = projectTopicsStream(projectId).observable.pipe(map(topics => topics.data));

    const subscription = observable.subscribe((topics) => {
      setProjectTopics(topics);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectTopics;
}
