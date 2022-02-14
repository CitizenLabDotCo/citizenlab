import { useState, useEffect } from 'react';
import {
  IProjectAllowedInputTopicData,
  projectAllowedInputTopicsStream,
} from 'services/projectAllowedInputTopics';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Parameters {
  projectId: string;
}

export default function useProjectAllowedInputTopics({
  projectId,
}: Parameters) {
  const [projectAllowedInputTopics, setProjectAllowedInputTopics] = useState<
    IProjectAllowedInputTopicData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    let observable: Observable<IProjectAllowedInputTopicData[] | null> =
      of(null);

    observable = projectAllowedInputTopicsStream(projectId).observable.pipe(
      map((topics) => topics.data.filter((topic) => topic))
    );

    const subscription = observable.subscribe((topics) => {
      setProjectAllowedInputTopics(topics);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectAllowedInputTopics;
}
