import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import {
  projectByIdStream,
  projectBySlugStream,
  IProject,
  IProjectData,
} from 'services/projects';

interface Props {
  projectId?: string | null;
  projectSlug?: string | null;
}

export default function useProject({ projectId, projectSlug }: Props) {
  const [project, setProject] = useState<
    IProjectData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    setProject(undefined);

    let observable: Observable<IProject | null> = of(null);

    if (projectId) {
      observable = projectByIdStream(projectId).observable;
    } else if (projectSlug) {
      observable = projectBySlugStream(projectSlug).observable;
    }

    const subscription = observable.subscribe((response) => {
      const project = !isNilOrError(response) ? response.data : response;
      setProject(project);
    });

    return () => subscription.unsubscribe();
  }, [projectId, projectSlug]);

  return project;
}
