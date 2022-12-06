import { useState, useEffect } from 'react';
import { projectModeratorsStream } from 'services/projectModerators';
import { IUserData } from 'services/users';

export default function useProjectModerators(projectId: string) {
  const [projectModerators, setProjectModerators] = useState<
    IUserData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = projectModeratorsStream(
      projectId
    ).observable.subscribe((response) => {
      setProjectModerators(response.data);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectModerators;
}
