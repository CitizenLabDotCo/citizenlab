import { useState, useEffect } from 'react';
import { IProjectTopicData, projectTopicsStream } from 'services/projectTopics';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Parameters {
  projectId: string;
}

export default function useProjectTopics({ projectId }: Parameters) {
  const [projectTopics, setProjectTopics] = useState<
    IProjectTopicData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    let observable: Observable<IProjectTopicData[] | null> = of(null);

    observable = projectTopicsStream(projectId).observable.pipe(
      map((topics) => topics.data.filter((topic) => topic))
    );

    const subscription = observable.subscribe((topics) => {
      setProjectTopics(topics);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectTopics;
}
