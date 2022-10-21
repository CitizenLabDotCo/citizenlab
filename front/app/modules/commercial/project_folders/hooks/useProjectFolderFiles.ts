import { useEffect, useState } from 'react';
import {
  IProjectFolderFiles,
  projectFolderFilesStream,
} from '../services/projectFolderFiles';

export default function useProjectFolderFiles(
  projectFolderId: string | undefined
) {
  const [projectFolderFile, setProjectFolderFiles] = useState<
    IProjectFolderFiles | undefined | null | Error
  >(undefined);
  useEffect(() => {
    const subscription = projectFolderId
      ? projectFolderFilesStream(projectFolderId).observable.subscribe(
          (projectFolderFile) => {
            setProjectFolderFiles(projectFolderFile);
          }
        )
      : null;

    return () => subscription?.unsubscribe();
  }, [projectFolderId]);

  return projectFolderFile;
}
