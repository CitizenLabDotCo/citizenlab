import { useState, useEffect } from 'react';
import { IUserData } from 'services/users';
import { projectManagersStream } from 'modules/project_management/services/projectManagers';

export default function useProjectManagers(projectId: string) {
  const [projectManagers, setProjectManagers] = useState<
    IUserData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = projectManagersStream(projectId).observable.subscribe(
      (response) => {
        setProjectManagers(response.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectManagers;
}
