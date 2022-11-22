import { useEffect, useState } from 'react';
import { Observable, of } from 'rxjs';
import {
  IProject,
  IProjectData,
  projectByIdStream,
  projectBySlugStream,
} from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  projectId?: string | null;
  projectSlug?: string | null;
}

export default function useProject({ projectId, projectSlug }: Props) {
  const [project, setProject] = useState<IProjectData | null>(null);

  useEffect(() => {
    setProject(null);

    let observable: Observable<IProject | null> = of(null);

    if (projectId) {
      observable = projectByIdStream(projectId).observable;
    } else if (projectSlug) {
      observable = projectBySlugStream(projectSlug).observable;
    }

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
