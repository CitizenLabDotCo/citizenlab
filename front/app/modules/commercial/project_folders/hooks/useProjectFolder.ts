import { useEffect, useState } from 'react';
import { Observable, of } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';
import {
  IProjectFolderData,
  projectFolderByIdStream,
  projectFolderBySlugStream,
} from '../services/projectFolders';

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
