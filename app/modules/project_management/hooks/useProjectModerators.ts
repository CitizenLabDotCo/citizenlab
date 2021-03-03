import { useState, useEffect } from 'react';
import { IUserData } from 'services/users';
import { projectModeratorsStream } from 'modules/project_management/services/projectModerators';

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
