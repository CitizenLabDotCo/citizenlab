import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IProjectGroupData,
  projectGroupsByProjectIdStream,
} from 'services/projectGroups';

interface Props {
  projectId: string;
}

export default function useProjectGroups({ projectId }: Props) {
  const [projectGroups, setProjectGroups] = useState<
    IProjectGroupData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    let observable: Observable<IProjectGroupData[] | null> = of(null);

    observable = projectGroupsByProjectIdStream(projectId).observable.pipe(
      map((groups) => groups.data.filter((group) => group))
    );

    const subscription = observable.subscribe((groups) => {
      setProjectGroups(groups);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectGroups;
}
