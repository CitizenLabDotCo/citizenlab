import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import {
  projectFolderByIdStream,
  projectFolderBySlugStream,
  IProjectFolderData,
} from 'modules/project_folders/services/projectFolders';

interface Props {
  projectFolderId?: string | null;
  projectFolderSlug?: string | null;
}

export default function useProjectFolder({
  projectFolderId,
  projectFolderSlug,
}: Props) {
  const [projectFolder, setProjectFolder] = useState<
    IProjectFolderData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    setProjectFolder(undefined);

    let observable: Observable<{ data: IProjectFolderData } | null> = of(null);

    if (projectFolderId) {
      observable = projectFolderByIdStream(projectFolderId).observable;
    } else if (projectFolderSlug) {
      observable = projectFolderBySlugStream(projectFolderSlug).observable;
    }

    const subscription = observable.subscribe((response) => {
      const projectFolder = !isNilOrError(response) ? response.data : response;
      setProjectFolder(projectFolder);
    });

    return () => subscription.unsubscribe();
  }, [projectFolderId, projectFolderSlug]);

  return projectFolder;
}
