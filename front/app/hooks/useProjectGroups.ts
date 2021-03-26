import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IGroupsProjectsData,
  groupsProjectsByProjectIdStream,
} from 'services/groupsProjects';

interface Props {
  projectId: string;
}

export default function useProjectGroups({ projectId }: Props) {
  const [projectGroups, setProjectGroups] = useState<
    IGroupsProjectsData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    let observable: Observable<IGroupsProjectsData[] | null> = of(null);

    observable = groupsProjectsByProjectIdStream(projectId).observable.pipe(
      map((groups) => groups.data.filter((group) => group))
    );

    const subscription = observable.subscribe((groups) => {
      setProjectGroups(groups);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectGroups;
}
