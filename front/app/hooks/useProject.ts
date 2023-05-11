import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable } from 'rxjs';
import {
  projectByIdStream,
  projectBySlugStream,
  IProject,
  IProjectData,
} from 'services/projects';

export interface Props {
  projectId?: string | null;
  projectSlug?: string | null;
}

export default function useProject({ projectId, projectSlug }: Props) {
  const [project, setProject] = useState<IProjectData | null | undefined>(
    undefined
  );

  useEffect(() => {
    setProject(undefined);
    let observable: Observable<IProject | null> | undefined;

    if (projectId) {
      observable = projectByIdStream(projectId).observable;
    } else if (projectSlug) {
      observable = projectBySlugStream(projectSlug).observable;
    }

    if (!observable) return;

    const subscription = observable.subscribe((response) => {
      if (isNilOrError(response)) {
        setProject(response);
        return;
      }

      setProject(response.data);
    });

    return () => subscription.unsubscribe();
  }, [projectId, projectSlug]);

  return project;
}
