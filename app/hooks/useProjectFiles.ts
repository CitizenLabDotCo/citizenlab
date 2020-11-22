import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';
import { projectFilesStream, IProjectFiles } from 'services/projectFiles';

export default function useProjectFiles(projectId: string | null | undefined) {
  const [projectFiles, setProjectFiles] = useState<
    IProjectFiles | undefined | null | Error
  >(undefined);
  useEffect(() => {
    setProjectFiles(undefined);

    let observable: Observable<IProjectFiles | null> = of(null);

    if (projectId) {
      observable = projectFilesStream(projectId).observable;
    }

    const subscription = observable.subscribe((projectFiles) => {
      setProjectFiles(projectFiles);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectFiles;
}
