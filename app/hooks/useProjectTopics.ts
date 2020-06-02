import { useState, useEffect } from 'react';
import { ITopicData, Code } from 'services/topics';
import { projectTopicsStream } from 'services/projectTopics';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Parameters {
  projectId: string;
  code?: Code[];
  exclude_code?: Code[];
  sort?: 'custom' | 'new';
}

export default function useProjectTopics({
  projectId,
  code,
  exclude_code,
  sort
}: Parameters) {
  const [projectTopics, setProjectTopics] = useState<ITopicData[] | undefined | null | Error>(undefined);
  const queryParameters = { code, exclude_code, sort };

  useEffect(() => {
    let observable: Observable<ITopicData[]| null> = of(null);

    observable = projectTopicsStream(projectId, { queryParameters }).observable.pipe(map(topics => topics.data));

    const subscription = observable.subscribe((topics) => {
      setProjectTopics(topics);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectTopics;
}
